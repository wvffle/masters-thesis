import * as consts from './consts'
import * as javascript from './js'

const encoder = new TextEncoder()
export const defineTests = ({ define, defineSeq, rs, js }) => {
  // // ============================
  // // Reenkodowanie stringów
  // // ============================
  // define(
  //   [100, 1e3, 1e4],
  //   'Reenkodowanie stringów (String 1KB)',
  //   () => [javascript.cryptoRandomString(consts.N_1K)],
  //   ...rs('reencode_strings')
  // )

  // define(
  //   [100, 1e3, 1e4],
  //   'Reenkodowanie stringów (String 512KB)',
  //   () => [javascript.cryptoRandomString(consts.N_512K)],
  //   ...rs('reencode_strings')
  // )

  // define(
  //   [100, 1e3, 1e4],
  //   'Reenkodowanie stringów (String 1MB)',
  //   () => [javascript.cryptoRandomString(consts.N_1M)],
  //   ...rs('reencode_strings')
  // )

  // // ============================
  // // Base64
  // // ============================
  // define(
  //   [100, 1e3, 1e4],
  //   'Enkodowanie do Base64 (String 1KB)',
  //   () => [javascript.cryptoRandomString(consts.N_1K)],
  //   ...js('btoa'),
  //   ...js('base64'),
  //   ...rs('base64'),
  //   ...rs('base64_simd')
  // )

  // define(
  //   [100, 1e3, 1e4],
  //   'Enkodowanie do Base64 (String 512KB)',
  //   () => [javascript.cryptoRandomString(consts.N_512K)],
  //   ...js('btoa'),
  //   ...js('base64'),
  //   ...rs('base64'),
  //   ...rs('base64_simd')
  // )

  // define(
  //   [100, 1e3, 1e4],
  //   'Enkodowanie do Base64 (String 1MB)',
  //   () => [javascript.cryptoRandomString(consts.N_1M)],
  //   ...js('btoa'),
  //   ...js('base64'),
  //   ...rs('base64'),
  //   ...rs('base64_simd')
  // )

  // // ============================
  // // Fibonacci
  // // ============================
  // define(
  //   [100, 500, 1e3],
  //   '20 liczba Fibonacciego (rekurencja)',
  //   [20],
  //   ...js('fib'),
  //   ...rs('fib')
  // )

  // define(
  //   [100, 500, 1e3],
  //   '30 liczba Fibonacciego (rekurencja)',
  //   [30],
  //   ...js('fib'),
  //   ...rs('fib')
  // )

  // define(
  //   [100, 500, 1e3],
  //   '40 liczba Fibonacciego (rekurencja)',
  //   [40],
  //   ...js('fib'),
  //   ...rs('fib')
  // )

  // // ============================
  // // Matrix Mult
  // // ============================

  // define(
  //   [100, 1e3, 1e4],
  //   'Mnożenie macierzy 4x4',
  //   () => [
  //     javascript.generateMatrix(4, 4),
  //     javascript.generateMatrix(4, 4)
  //   ],
  //   ...js('multiplyMatrices'),
  //   ...rs('matrix_mult'),
  //   ...rs('matrix_mult_simd'),
  // )

  // // ============================
  // // CRC32
  // // ============================
  // define(
  //   [100, 1e3, 1e4],
  //   'CRC32 (Plik 1KB)',
  //   () => [encoder.encode(javascript.cryptoRandomString(consts.N_1K))],
  //   ...rs('crc32'),
  //   ...js('crc32'),
  // )

  // define(
  //   [100, 1e3, 1e4],
  //   'CRC32 (Plik 512KB)',
  //   () => [encoder.encode(javascript.cryptoRandomString(consts.N_512K))],
  //   ...rs('crc32'),
  //   ...js('crc32'),
  // )

  // define(
  //   [100, 1e3, 1e4],
  //   'CRC32 (Plik 1MB)',
  //   () => [encoder.encode(javascript.cryptoRandomString(consts.N_1M))],
  //   ...rs('crc32'),
  //   ...js('crc32'),
  // )

  // // ============================
  // // CRC64
  // // ============================

  // define(
  //   [100, 1e3, 1e4],
  //   'CRC64 (Plik 1KB)',
  //   () => [encoder.encode(javascript.cryptoRandomString(consts.N_1K))],
  //   ...rs('crc64'),
  //   ...js('crc64'),
  //   ...rs('crc64_simd'),
  // )

  // define(
  //   [100, 1e3, 1e4],
  //   'CRC64 (Plik 512KB)',
  //   () => [encoder.encode(javascript.cryptoRandomString(consts.N_512K))],
  //   ...rs('crc64'),
  //   ...js('crc64'),
  //   ...rs('crc64_simd'),
  // )

  // define(
  //   [100, 1e3, 1e4],
  //   'CRC64 (Plik 1MB)',
  //   () => [encoder.encode(javascript.cryptoRandomString(consts.N_1M))],
  //   ...rs('crc64'),
  //   ...js('crc64'),
  //   ...rs('crc64_simd'),
  // )

  // ============================
  // API DOM
  // ============================

  defineSeq(
    [10, 100, 500],
    'API DOM',
    [
      100
    ],
    ['Tworzenie 100 elementów', 'Aktualizacja co drugiego elementu z 100', 'Aktualizacja co drugiego elementu z 100', 'Usuwanie 100 elementów'],
    [
      js('createElements'),
      js('updateEvery2ndElement'),
      js('updateEvery2ndElement'),
      js('clearElements')
    ],
    [
      rs('create_elements'),
      rs('update_every_2nd_element'),
      rs('update_every_2nd_element'),
      rs('clear_elements')
    ],
  )

  defineSeq(
    [10, 100, 500],
    'API DOM',
    [
      1000
    ],
    ['Tworzenie 1000 elementów', 'Aktualizacja co drugiego elementu z 1000', 'Aktualizacja co drugiego elementu z 1000', 'Usuwanie 1000 elementów'],
    [
      js('createElements'),
      js('updateEvery2ndElement'),
      js('updateEvery2ndElement'),
      js('clearElements')
    ],
    [
      rs('create_elements'),
      rs('update_every_2nd_element'),
      rs('update_every_2nd_element'),
      rs('clear_elements')
    ],
  )

  defineSeq(
    [10, 100, 500],
    'API DOM',
    [
      10000
    ],
    ['Tworzenie 10000 elementów', 'Aktualizacja co drugiego elementu z 10000', 'Aktualizacja co drugiego elementu z 10000', 'Usuwanie 10000 elementów'],
    [
      js('createElements'),
      js('updateEvery2ndElement'),
      js('updateEvery2ndElement'),
      js('clearElements')
    ],
    [
      rs('create_elements'),
      rs('update_every_2nd_element'),
      rs('update_every_2nd_element'),
      rs('clear_elements')
    ],
  )

}
