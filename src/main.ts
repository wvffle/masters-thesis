import * as rust from './rust'
import * as javascript from './js'
import * as consts from './consts'

type AnyFn = (...args: any[]) => any

interface TestFn {
  name: string
  type: 'rust' | 'js'
  fn: AnyFn
}

interface Test {
  n: number
  name: string
  args: any[]
  fns: TestFn[]
}

type Perf = { type: 'js', duration: number } | { type: 'rust', duration: number, deserialize: number, serialize: number, init: number, alg: number }

        interface Run {
          type: 'js' | 'rust'
          fn: string
          ops: number
          mean: number
          duration: number
          perfs: Perf[]
  out: string
        }


const tests: Test[] = []
setTimeout(() => {
  const tbody = document.querySelector('tbody')!
  const thead = document.querySelector('thead')!
  const pre = document.querySelector('pre')!
  const maxConsecutive = tests.reduce((acc, test) => {
    acc.js = Math.max(acc.js, test.fns.reduce((acc, { type }) => acc + +(type === 'js'), 0))
    acc.rust = Math.max(acc.rust, test.fns.reduce((acc, { type }) => acc + +(type === 'rust'), 0))
    return acc
  }, { js: 0, rust: 0})

  thead.append(document.createElement('th'))

  let th = document.createElement('th')
  th.colSpan = maxConsecutive.js
  th.classList.add('js')
  th.textContent = 'JavaScript'
  thead.append(th)

  th = document.createElement('th')
  th.colSpan = maxConsecutive.rust
  th.classList.add('rust')
  th.textContent = 'Rust'
  thead.append(th)

  const chart = document.querySelector('.chart')!
  const renderRun = (run: Run) => {
    document.querySelector('.runs .selected')?.classList.remove('selected')
    pre.textContent = `algorithm = ${run.fn}\nlanguage  = ${run.type}\nduration  = ${run.duration}ms\nmean      = ${run.mean}ms\nperf      = ${run.ops}ops/s\n\noutput    = ${run.out}`

    const n = runs.indexOf(run) + 1
    document.querySelector(`.runs tr:nth-child(${n})`)?.classList.add('selected')

    chart.innerHTML = ''
    if (run.type === 'rust') {
      const sum = run.perfs.reduce((acc, measurements) => {
        for (const [k, v] of Object.entries(measurements)) {
          if (k === 'type') continue
          acc[k + ''] ??= 0
          acc[k + ''] += v
        }
        return acc
      }, {})

      chart.style.gridTemplateColumns = `${sum.deserialize}fr ${sum.init}fr ${sum.alg}fr ${sum.serialize}fr `
      let bar = document.createElement('div')
      bar.title = `Deserialization:  ${sum.deserialize}ms`
      bar.textContent = `${Math.round(sum.deserialize)}ms`
      chart.append(bar)

      bar = document.createElement('div')
      bar.title = `Init:  ${sum.init}ms`
      bar.textContent = `${Math.round(sum.init)}ms`
      chart.append(bar)

      bar = document.createElement('div')
      bar.title = `Algorithm:  ${sum.alg}ms`
      bar.textContent = `${Math.round(sum.alg)}ms`
      chart.append(bar)

      bar = document.createElement('div')
      bar.title = `Serialization:  ${sum.serialize}ms`
      bar.textContent = `${Math.round(sum.serialize)}ms`
      chart.append(bar)

    } else {
      chart.style.gridTemplateColumns = `0 0 1fr`
      const bar = document.createElement('div')
      bar.title = `Duration:  ${run.duration}ms`
      bar.textContent = `${Math.round(run.duration)}ms`

      // 2 dummy, so that the bar is same color
      chart.append(document.createElement('div'))
      chart.append(document.createElement('div'))
      chart.append(bar)
    }
  }


  const runs: Run[] = []
  const rtbody = document.querySelector('.runs tbody')!
  const updateRuns = () => {
    rtbody.innerHTML = ''

    for (const run of runs) {
      const tr = document.createElement('tr')
      tr.className = run.type

      let td = document.createElement('td')
      td.textContent = run.fn
      tr.append(td)

      td = document.createElement('td')
      td.textContent = Math.round(run.duration) + 'ms'
      tr.append(td)

      td = document.createElement('td')
      td.textContent = run.ops + 'ops/s'
      tr.append(td)

      rtbody.append(tr)
      tr.addEventListener('click', () => {
        renderRun(run)
      })
    }

    renderRun(runs[runs.length - 1])
  }


  for (const test of tests) {
    const tr = document.createElement('tr')
    const td = document.createElement('td')
    td.textContent = `${test.name} (n=${test.n})`
    tr.append(td)

    let i = 0
    let isRs = false
    for (const testFn of test.fns) {
      const td = document.createElement('td')
      const button = document.createElement('button')

      button.textContent = `Run ${testFn.name}`
      button.addEventListener('click', async () => {
        performance.clearMarks()
        const perfs = []

        let out
        for (let i = 0; i < test.n; i++) {
          performance.mark('start', { detail: { i } })
          out = await testFn.fn(...test.args)
          performance.mark('end', { detail: { i } })
          const measure = performance.measure('duration', 'start', 'end')
          const perf: Perf = testFn.type === 'js'
            ? { type: 'js', duration: measure.duration }
            : {
              type: 'rust',
              duration: measure.duration,
              deserialize: performance.measure('deserialize', 'start', 'rs-init-end').duration,
              serialize: performance.measure('serialize', 'rs-alg-end', 'end').duration,
              init: performance.measure('init', 'rs-init-end', 'rs-alg-start').duration,
              alg: performance.measure('alg', 'rs-alg-start', 'rs-alg-end').duration,
            }
          perfs.push(perf)
        }
        const duration = perfs.reduce((a, b) => a + b.duration, 0)
        const mean = duration / perfs.length
        const ops = Math.round(1000 * test.n / duration)
        runs.push({ out, type: testFn.type, fn: testFn.name, ops, mean, duration, perfs })
        updateRuns()
      })

      td.appendChild(button)


      i++
      td.classList.add(testFn.type)
      if (!isRs && testFn.type === 'rust') {
        isRs = true
        for (let j = 0; j < maxConsecutive.js - i + 1; j++) {
          const td = document.createElement('td')
          td.classList.add('js')
          tr.append(td)
        }
        i = 0
      }

      tr.appendChild(td)
    }

        for (let j = 0; j < maxConsecutive.rust - i - 1; j++) {
          const td = document.createElement('td')
          td.classList.add('rust')
          tr.append(td)
        }

    tbody.appendChild(tr)
  }
})

const define = (n: number, name: string, args: any[], ...fns: TestFn[]) => {
  tests.push({ n, name, args, fns: fns.sort((a, b) => {
    if (a.type === 'js' && b.type === 'rust') return -1
    if (a.type === 'rust' && b.type === 'js') return 1
    return 0
  }) })
}

const js = (name: keyof typeof javascript): TestFn => ({ name, type: 'js', fn: javascript[name] })
const rs = (name: keyof typeof rust): TestFn => ({ name, type: 'rust', fn: rust[name] })


define(
  1000,
  'String Re-encoding',
  [consts.TEXT_1M],
  rs('reencode_strings')
)
define(
  1000,
  'Base64 Encoding',
  [consts.TEXT_1M],
  js('btoa'),
  js('base64'),
  rs('base64'),
  rs('base64_simd')
)


define(
  10,
  'fib(40)',
  [40],
  js('fib'),
  rs('fib')
)

define(
  1000,
  'fib(40) cached',
  [40],
  js('fibObject'),
  js('fibMap'),
  rs('fib_hashmap'),
  rs('fib_btreemap')
)

const A = javascript.generateMatrix(100, 100)
const B = javascript.generateMatrix(100, 100)
define(
  1000,
  'Matrix multiplication 100x100',
  [
    A,
    B
  ],
  js('multiplyMatrices'),
  rs('matrix_mult'),
)

define(
  100,
  'CRC32',
  [
    consts.TEXT_1M_UINT8
  ],
  rs('crc32'),
  js('crc32'),
)

define(
  100,
  'CRC64',
  [
    consts.TEXT_1M_UINT8
  ],
  rs('crc64'),
  js('crc64'),
)

define(
  1,
  'Create 10000 elements',
  [
    10000
  ],
  rs('create_elements'),
  js('createElements'),
)

define(
  1,
  'Update half of the elements',
  [
    10000
  ],
  rs('update_every_2nd_element'),
  js('updateEvery2ndElement'),
)

define(
  1,
  'Clear elements',
  [],
  rs('clear_elements'),
  js('clearElements'),
)

define(
  100,
  'SHA256 hashing',
  [
    consts.TEXT_1M_UINT8
  ],
  rs('sha256'),
  js('sha256'),
  js('cryptoSha256'),
)

define(
  100,
  'SHA512 hashing',
  [
    consts.TEXT_1M_UINT8
  ],
  rs('sha512'),
  js('sha512'),
  js('cryptoSha512'),
)

define(
  10,
  'Argon2id hashing',
  [],
  rs('argon2'),
  js('argon2'),
)
