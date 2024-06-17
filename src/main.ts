import * as rust3 from './rust/opt-3'
import * as rustS from './rust/opt-s'
import * as rustZ from './rust/opt-z'
import * as javascript from './js'
import * as Plot from '@observablehq/plot'
import hash from 'object-hash'
import { slugify } from 'transliteration'
import html2canvas from 'html2canvas'
// @ts-expect-error no types
import screenshot from 'canvas-screenshot'
import { set, keys, delMany, getMany, setMany } from 'idb-keyval'
// @ts-expect-error no types
import { saveAs } from 'file-saver'
import { defineTests } from './tests'

const currentTest = document.querySelector('.current-test')!
const currentN = document.querySelector('.current-n')!

const testsDone = document.querySelector('.tests-done')!
const testsAll = document.querySelector('.tests-all')!

currentTest.textContent = localStorage.getItem('currentTest')
currentN.textContent = localStorage.getItem('currentN')

testsDone.textContent = localStorage.getItem('testsDone')
testsAll.textContent = localStorage.getItem('testsAll')

const storeObject = async (prefix: string, obj: Record<string, any>) => {
  const data: any = Object.entries(obj)
    .map(([k, v]) => [`${prefix}:${k}`, v])
  await setMany(data)
}

const loadObject = async (prefix: string): Promise<Record<string, any>> => {
  const k = await keys().then(keys => keys.filter((k: any) => k.startsWith(`${prefix}:`)))
  const values = await getMany(k)

  const data = {}
    for (let i = 0; i < k.length; ++i) {
    // @ts-expect-error ignore
    data[k[i].slice(prefix.length + 1)] = values[i]
  }
  return data
}

const clearObject = async (prefix: string) => {
  // @ts-expect-error ignore
  const k = await keys().then(keys => keys.filter((k) => k.startsWith(`${prefix}:`)))
  return delMany(k)
}

type AnyFn = (...args: any[]) => any

type RustTestType = 'rust:3' | 'rust:s' | 'rust:z'
type JsTestType = 'js'
type TestType = JsTestType | RustTestType

interface TestFn {
  name: string
  type: TestType
  fn: AnyFn
}

type TestArgs = any[] | (() => any[])
type Test = {
  args: TestArgs
  strat: 'default'
  fns: TestFn[]
} | {
  args: TestArgs
  strat: 'sequential'
  stages: string[],
  fns: TestFn[][]
}

type Perf = { type: JsTestType, duration: number, result?: any } | { type: RustTestType, duration: number, deserialize: number, serialize: number, alg: number, result?: any }

const tests: Record<string, Record<number, Test>> = {}
const define = (ns: number[], name: string, args: TestArgs, ...fns: TestFn[]) => {
  tests[name] ??= {}
  for (const n of ns) {
    tests[name][n] = { args, strat: 'default', fns: fns.sort((a, b) => a.type.localeCompare(b.type)) }
  }
}

const defineSeq = (ns: number[], name: string, args: TestArgs, stages: string[], ...fns: TestFn[][]) => {
  tests[name] ??= {}
  for (const n of ns) {
    tests[name][n] = { args, strat: 'sequential', stages, fns }
  }
}

const js = (name: keyof typeof javascript): TestFn[] => [{ name, type: 'js', fn: javascript[name] }]
const rs = (name: keyof typeof rust3): TestFn[] => [
  { name, type: 'rust:3', fn: rust3[name] },
  { name, type: 'rust:s', fn: rustS[name] },
  { name, type: 'rust:z', fn: rustZ[name] },
]

defineTests({
  define, defineSeq, rs, js
})

type PerfFnConfig = {
  fn: AnyFn,
  testName: string,
  fnName: string,
}

const argsCache = (await loadObject('argsCache')) ?? {}
const createPerfFn = (
  configs: PerfFnConfig[],
  n: number,
  type: TestType,
  args: TestArgs
) => async () => {
  performance.clearMarks()

  for (let i = 0; i < n; i++) {
    let currentArgs = args

    for (const { testName, fnName, fn } of configs) {
      if (typeof args === 'function') {
        argsCache[testName] ??= {}
        if (typeof argsCache[testName][n] === 'undefined') {
          argsCache[testName][n] = args()
          await set(`argsCache:${testName}`, argsCache[testName])
        }
        currentArgs = argsCache[testName][n]
      }
      const N = n * configs.filter(c => c.fnName === fnName).length

      performance.mark('start', { detail: { i, n: N, type } })
      let result = await fn(...currentArgs as any[])
      performance.mark('end', { detail: { i, n: N, type } })

      result = i === 0 ? hash({ result }) : null

      const measure = performance.measure('duration', 'start', 'end')
      const perf: Perf = type === 'js'
        ? { type, duration: measure.duration, result }
        : {
          type,
          result,
          duration: measure.duration,
          deserialize: performance.measure('deserialize', 'start', 'rs-alg-start').duration,
          alg: performance.measure('alg', 'rs-alg-start', 'rs-alg-end').duration,
          serialize: performance.measure('serialize', 'rs-alg-end', 'end').duration,
        }


      perfs[testName] ??= {}
      perfs[testName][N] ??= {}
      perfs[testName][N][fnName] ??= []
      perfs[testName][N][fnName].push(perf)
    }
  }
}

const toReducedSeqName = (names: string[]): string => {
    let result = '';
    let prevName = names[0];
    let count = 0;

    for (let i = 0; i < names.length; i++) {
        if (names[i] === prevName) {
            count++;
        } else {
            result += prevName + (count > 1 ? ' × ' + count : '') + ' → ';
            prevName = names[i];
            count = 1;
        }
    }

    result += prevName + (count > 1 ? ' × ' + count : '');
    return result;
}


type Perfs = Record<string, Record<number, Record<string, Perf[]>>>
const perfs: Perfs = (await loadObject('perfs')) ?? {}

const exportData = async () => {
  await saveAs(new Blob([JSON.stringify({ hash: hash(testsToRun), perfs })]), `results.${hash(testsToRun).slice(0, 8)}.json`)
}
window.exportData = exportData

const testsToRun = Object.entries(tests).flatMap(([name, ns]) => {

  return Object.entries(ns).flatMap(([n, test]) => {
    if (test.strat === 'sequential') {
      function transpose(matrix) {
        return matrix[0].map((col, c) => matrix.map((row, r) => matrix[r][c]));
      }

      return test.fns.map(x => transpose(x)).flatMap(fns => {
        return fns.map(fns => {
          const [{ type }] = fns
          return {
            name: `${name} // ${type} // ${toReducedSeqName(fns.map(f => f.name))}`,
            n,
            fn: async () => {
              const configs = fns.map(({ fn, name: fnName }, i) => ({
                testName: `${name}: ${test.stages[i++]}`,
                fnName,
                fn
              }))

              await createPerfFn(configs, +n, type, test.args)()
            }
          }
        })

        return {
          name: `${name} // ${type} // ${toReducedSeqName(fns.map(f => f.name))}`,
          n,
          fn: async () => {
            const configs = fns.map(({ fn, name: fnName }, i) => ({
              testName: `${name}: ${test.stages[i++]}`,
              fnName,
              fn
            }))

            await createPerfFn(configs, +n, type, test.args)()
          }
        }
      })
    }

    return test.fns.map(({ fn, type, name: fnName }) => ({
      name: `${name} // ${type} // ${fnName}`,
      n,
      fn: createPerfFn([{ testName: name, fnName, fn }], +n, type, test.args)
    }))
  }, 0)
}, 0)
console.log(testsToRun)
testsAll.textContent = testsToRun.length + ''

const run = async () => {
  const i = +(localStorage.getItem('i') ?? 0)

  if (i < testsToRun.length) {
    await testsToRun[i].fn()
    localStorage.setItem('i', `${i + 1}`)
    await storeObject('perfs', perfs)
    localStorage.setItem('currentTest', testsToRun[i + 1]?.name)
    localStorage.setItem('currentN', `${+testsToRun[i + 1]?.n}`)
    localStorage.setItem('testsDone', `${+(localStorage.getItem('testsDone') ?? 0) + 1}`)
    return false
  }

  localStorage.setItem('stoppedAt', +new Date() + '')
  return true
}

const btn = document.querySelector('button')!
const running = localStorage.getItem('running') === hash(testsToRun)

if (!running) {
  btn.textContent = 'Start'
  const error: HTMLDivElement | null = document.querySelector('.error')
  const imp: HTMLDivElement = document.querySelector('.import')!
  imp.style.display = 'block'

  if (error) {
    error.style.display = 'block'
    error.textContent = 'State invalidated, please restart the tests'
  }
}

btn.addEventListener('click', async () => {
  if (!running) {
    localStorage.setItem('i', '0')
    await clearObject('perfs')
    await clearObject('argsCache')
    localStorage.setItem('startedAt', +new Date() + '')
    localStorage.setItem('running', hash(testsToRun))
    localStorage.setItem('hash', hash(testsToRun))
    localStorage.setItem('testsDone', '0')
    localStorage.setItem('testsAll', testsToRun.length + '')
    localStorage.setItem('currentTest', testsToRun[0].name)
    localStorage.setItem('currentN', '1')
    location.reload()
    return
  }

  localStorage.setItem('running', '')
  location.reload()
})


setTimeout(async () => {
  try {

    if (running && !await run()) {
      location.reload()
      throw new Error('Reloading')
    }

    if (localStorage.getItem('hash') !== hash(testsToRun)) {
      localStorage.setItem('running', '')
      return
    }

    localStorage.setItem('running', '')
    header.remove()
    select.style.display = 'block'
    imp.style.display = 'block'
    select.value = Object.keys(perfs)[0]
    select.dispatchEvent(new Event('change'))

  } catch (err) {
    if ((err as Error).message === 'Reloading') return
    console.error(err)

    const error: HTMLDivElement | null = document.querySelector('.error')
    if (error) {
      error.style.display = 'block'
    }
  }
}, 10)

const header = document.querySelector('header')!
const imp: HTMLButtonElement = document.querySelector('.import')!
imp.addEventListener('click', () => {
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'application/json'
  fileInput.addEventListener('input', async () => {
    const [file] = fileInput.files!
    const data = JSON.parse(await file.text())
    localStorage.setItem('hash', hash(testsToRun))
    await clearObject('perfs')
    await storeObject('perfs', data.perfs)
    location.reload()
  })
  fileInput.click()
})

const select: HTMLSelectElement = document.querySelector('select')!
for (const name in perfs) {
  const option = document.createElement('option')
  option.textContent = name
  select.appendChild(option)
}

const results: HTMLDivElement = document.querySelector('.results')!
select.addEventListener('change', () => {
  results.innerHTML = ''
  const ns = perfs[select.value]
  if (!ns) return

  type DataType = {
    n: string
    fn: string
    lang: TestType
    typefn: string
    type: 'Algorytm' | 'Deserializacja' | 'Serializacja'
    duration: number
  }

  const data: DataType[] = Object.entries(ns).flatMap(([n, perfs]) => Object.entries(perfs).flatMap(([fn, perfs]) => perfs.flatMap((perf) => {
    if (perf.type === 'js') {
      return { n, fn, lang: perf.type, typefn: `javascript: ${fn}`, type: 'Algorytm', duration: perf.duration }
    }

    return [
      { n, fn, lang: perf.type, typefn: `${perf.type}: ${fn}`, type: 'Deserializacja', duration: perf.deserialize },
      { n, fn, lang: perf.type, typefn: `${perf.type}: ${fn}`, type: 'Algorytm', duration: perf.alg },
      { n, fn, lang: perf.type, typefn: `${perf.type}: ${fn}`, type: 'Serializacja', duration: perf.serialize },
    ] as DataType[]
  })))

  const plot = Plot.plot({
    color: { legend: true },
    x: { grid: true, label: 'Średni czas [ms]' },
    y: { label: null },
    fy: { label: 'Ilość powtórzeń (n)' },
    marginRight: 70,
    marginLeft: 10,
    marks: [
      Plot.barX(data, Plot.groupY({ x: 'mean' }, { x: 'duration', fy: 'n', y: 'typefn', fill: 'type', tip: true })),
      Plot.axisY({ textAnchor: "start", fill: "black", dx: 14, tickSize: 0 })
    ],
  })

  results.append(plot)

  const sum = data.toSorted((a, b) => +a.n - +b.n).reduce((acc, item) => {
    acc[item.lang] ??= {}
    acc[item.lang][item.fn] ??= {}
    acc[item.lang][item.fn][item.n] ??= { Algorytm: 0 }
    acc[item.lang][item.fn][item.n][item.type] ??= 0
    acc[item.lang][item.fn][item.n][item.type] += item.duration
    return acc
  }, {} as Record<TestType, Record<string, Record<string, Measure>>>)

  const button = document.createElement('button')
  button.textContent = 'Download Image'

  button.addEventListener('click', async () => {
    const canvas = await html2canvas(plot as HTMLElement, {
      scale: 3,
      width: plot.querySelector('svg[class^=plot]')!.getBoundingClientRect().width
    })
    await screenshot(canvas, { filename: `${slugify(select.value)}.png` })
  })

  results.append(button)

  const save = document.createElement('button')
  save.textContent = 'Export JSON'
  save.addEventListener('click', exportData)

  results.append(save)
  results.append(document.createElement('br'))
  results.append(document.createElement('br'))

  const textarea = document.createElement('textarea')
  textarea.style.width = '1600px'
  textarea.style.height = '300px'
  textarea.readOnly = true


  const expo = (x: number) => {
    if (x < 1000) return x
    const [a, b] = x.toExponential().split('e+')
    return `${a}0^{${b}}`
  }

  const lang = (lang: string) => {
    switch (lang) {
      case 'js': return '$JS$'
      case 'rust:3': return '$RS_{3}$'
      case 'rust:s': return '$RS_{s}$'
      case 'rust:z': return '$RS_{z}$'
      default: return lang
    }
  }

  type Measure = { Algorytm: number, Deserializacja?: number, Serializacja?: number }
  const mean = (measure: Measure, n: number) => {
    return [
      typeof measure.Deserializacja !== 'undefined' ? (measure.Deserializacja / n).toFixed(4) : '---',
      (measure.Algorytm / n).toFixed(4),
      typeof measure.Serializacja !== 'undefined' ? (measure.Serializacja / n).toFixed(4) : '---',
    ].join(' & ')
  }

  const nKeys = Object.keys(ns)
  const nCount = nKeys.length
  let i = 0, j = 0
  textarea.textContent = `
\\fig{Wykres średniego czasu wykonania testu „${select.value}”}{${slugify(select.value)}.png}

\\begin{table}[h!]
  \\centering
  \\begin{NiceTabular}{clll}[hvlines]
    \\textbf{Język} & $F_i$ & \\textbf{Funkcja} & \\textbf{Opis funkcji} \\\\
    ${
      Object.entries(sum).map(([language, fns]) => {
        const fnCount = Object.keys(fns).length
        return `\\Block{${fnCount}-1}{${lang(language)}} & ${
          Object.keys(fns).map((fn) => {
            return `$F_{${++j}}$ & ${fn.replace(/(_)/g, '\\$1')} &  \\\\ % TODO: Dodać opis!`
          }).join('\n      & ')
        }`
      }).join('\n    ')
    }
  \\end{NiceTabular}
  \\vspace{0.5cm}
  \\caption{Opis funkcji dla testu „${select.value}”}
  \\label{tab:${slugify(select.value)}-fns}
\\end{table}

\\begin{table}[h!]
  \\centering
  \\begin{NiceTabular}{cl${'c'.repeat(3 * nCount)}}[corners,hvlines]
    & & \\Block{1-${3 * nCount}}{\\textbf{Średni czas wykonania [ms]}} \\\\
    & & ${nKeys.map(n => `\\Block{1-3}{$n=${expo(+n)}$}`).join(' & & & ')} \\\\
    &${' & $\\overline{T}_S$ &  $\\overline{T}_A$ & $\\overline{T}_D$'.repeat(nCount)} \\\\
    ${
      Object.entries(sum).map(([language, fns]) => {
        const fnCount = Object.keys(fns).length
        return `\\Block{${fnCount}-1}{${lang(language)}} & ${
          Object.values(fns).map((nns) => {
            return `$F_{${++i}}$ & ${
              nKeys.map((n) => {
                return mean(nns[n], +n)
              }).join(' & ')
            }`
          }).join(' \\\\\n      & ')
        }`
      }).join('\\\\\n    ')
    } \\\\
  \\end{NiceTabular}
  \\vspace{0.5cm}
  \\caption{Wyniki dla testu „${select.value}”}
  \\label{tab:${slugify(select.value)}}
\\end{table}
`.trim()
  results.append(textarea)


  results.style.display = 'block'
  console.log(perfs)
})
