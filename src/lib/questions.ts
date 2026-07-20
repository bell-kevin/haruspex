// SPDX-License-Identifier: AGPL-3.0-only

export interface Question {
  q: string
  a: number
  unit: string
  cat: 'science' | 'history' | 'geography' | 'culture' | 'tech' | 'world'
}

/**
 * The workout deals ten of these and asks for a range you're 90% sure
 * contains the answer. Additions welcome — keep them verifiable, stable
 * over time, and phrased so a single number is unambiguously correct.
 */
export const QUESTIONS: Question[] = [
  { q: 'Speed of light in a vacuum, to the nearest whole km/s', a: 299792, unit: 'km/s', cat: 'science' },
  { q: 'Height of Mount Everest per the 2020 China–Nepal survey', a: 8849, unit: 'm', cat: 'geography' },
  { q: 'Average distance from the Earth to the Moon', a: 384400, unit: 'km', cat: 'science' },
  { q: 'Year the Berlin Wall fell', a: 1989, unit: 'year', cat: 'history' },
  { q: 'Year the Berlin Wall went up', a: 1961, unit: 'year', cat: 'history' },
  { q: 'Year of the first crewed Moon landing', a: 1969, unit: 'year', cat: 'history' },
  { q: 'Number of elements on the periodic table', a: 118, unit: 'elements', cat: 'science' },
  { q: 'Bones in the adult human body', a: 206, unit: 'bones', cat: 'science' },
  { q: 'Keys on a standard piano', a: 88, unit: 'keys', cat: 'culture' },
  { q: 'Official marathon distance', a: 42.195, unit: 'km', cat: 'culture' },
  { q: 'Member states of the United Nations', a: 193, unit: 'states', cat: 'world' },
  { q: 'Year the Titanic sank', a: 1912, unit: 'year', cat: 'history' },
  { q: "Length of Earth's equator", a: 40075, unit: 'km', cat: 'geography' },
  { q: 'Year the U.S. Declaration of Independence was adopted', a: 1776, unit: 'year', cat: 'history' },
  { q: 'Year the U.S. Constitution was signed', a: 1787, unit: 'year', cat: 'history' },
  { q: 'Year the French Revolution began', a: 1789, unit: 'year', cat: 'history' },
  { q: 'Year World War II ended', a: 1945, unit: 'year', cat: 'history' },
  { q: 'Year World War I began', a: 1914, unit: 'year', cat: 'history' },
  { q: 'Symphonies Beethoven completed', a: 9, unit: 'symphonies', cat: 'culture' },
  { q: 'Atomic number of gold', a: 79, unit: '', cat: 'science' },
  { q: 'Current height of the Eiffel Tower, antennas included', a: 330, unit: 'm', cat: 'geography' },
  { q: 'Statue of Liberty, ground to torch tip', a: 93, unit: 'm', cat: 'geography' },
  { q: "Year of the Wright brothers' first powered flight", a: 1903, unit: 'year', cat: 'history' },
  { q: 'Average Earth–Sun distance, in millions of km', a: 149.6, unit: 'million km', cat: 'science' },
  { q: 'Number of moons of Mars', a: 2, unit: 'moons', cat: 'science' },
  { q: 'Chromosomes in a typical human cell', a: 46, unit: 'chromosomes', cat: 'science' },
  { q: 'Speed of sound in air at 20 °C', a: 343, unit: 'm/s', cat: 'science' },
  { q: 'Year Google was founded', a: 1998, unit: 'year', cat: 'tech' },
  { q: 'Year Linus Torvalds released the first Linux kernel', a: 1991, unit: 'year', cat: 'tech' },
  { q: 'Year Richard Stallman announced the GNU Project', a: 1983, unit: 'year', cat: 'tech' },
  { q: 'Year the first website went live at CERN', a: 1991, unit: 'year', cat: 'tech' },
  { q: 'Length of an Olympic swimming pool', a: 50, unit: 'm', cat: 'culture' },
  { q: 'Height of Angel Falls, the tallest waterfall', a: 979, unit: 'm', cat: 'geography' },
  { q: 'Height of Mount Kilimanjaro', a: 5895, unit: 'm', cat: 'geography' },
  { q: 'Height of Denali', a: 6190, unit: 'm', cat: 'geography' },
  { q: 'Main span of the Golden Gate Bridge', a: 1280, unit: 'm', cat: 'geography' },
  { q: 'Year of the Chernobyl disaster', a: 1986, unit: 'year', cat: 'history' },
  { q: 'Year Constantinople fell to the Ottomans', a: 1453, unit: 'year', cat: 'history' },
  { q: "Year Darwin published On the Origin of Species", a: 1859, unit: 'year', cat: 'science' },
  { q: 'Absolute zero, in degrees Celsius', a: -273.15, unit: '°C', cat: 'science' },
  { q: 'Year of Magna Carta', a: 1215, unit: 'year', cat: 'history' },
  { q: 'Year the Sydney Opera House opened', a: 1973, unit: 'year', cat: 'culture' },
  { q: 'Year the Panama Canal opened', a: 1914, unit: 'year', cat: 'history' },
  { q: 'Year the Suez Canal opened', a: 1869, unit: 'year', cat: 'history' },
  { q: 'Year Watson and Crick published the DNA double helix', a: 1953, unit: 'year', cat: 'science' },
  { q: 'Liters in one U.S. gallon', a: 3.785, unit: 'L', cat: 'science' },
  { q: 'Kilometers in one mile', a: 1.609, unit: 'km', cat: 'science' },
  { q: 'Teeth in a full adult set, wisdom teeth included', a: 32, unit: 'teeth', cat: 'science' },
  { q: 'Bones in one human hand', a: 27, unit: 'bones', cat: 'science' },
  { q: 'Year the first iPhone was announced', a: 2007, unit: 'year', cat: 'tech' },
  { q: "Sidereal period of the Moon's orbit", a: 27.3, unit: 'days', cat: 'science' },
  { q: "Mercury's orbital period, in Earth days", a: 88, unit: 'days', cat: 'science' },
]
