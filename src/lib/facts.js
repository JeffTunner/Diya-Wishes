// 25 well-documented, accurate Diwali facts under 30 words with no record counts or precise statistics
export const FACTS = [
  "The word Diwali comes from the Sanskrit 'Deepavali', meaning a continuous row or series of clay lamps.",
  "Diwali marks the darkest night of the Hindu lunisolar calendar month of Kartika, celebrating light illuminating deep darkness.",
  "Clay diyas are traditionally fueled with mustard oil or pure ghee, carrying cotton wicks symbolizing inner spiritual purity.",
  "Rangoli designs at house thresholds are crafted to welcome Goddess Lakshmi, ward off negativity, and greet arriving guests with beauty.",
  "In northern India, Diwali honors the return of Lord Rama, Sita, and Lakshmana to Ayodhya after fourteen years of exile.",
  "In southern India, the celebration commemorates Lord Krishna's victory over the demon king Narakasura, marking the triumph of righteousness.",
  "Jains observe Diwali as the sacred anniversary of Lord Mahavira attaining Nirvana and liberation from the cycle of rebirth.",
  "For Sikhs, Diwali coincides with Bandi Chhor Divas, celebrating the release of Guru Hargobind Ji from Gwalior Fort.",
  "Dhanteras, the first day of the festival, is dedicated to Dhanvantari, the revered divine physician who brought the gift of Ayurveda.",
  "On Dhanteras, families welcome good fortune by bringing home new metal utensils, brass items, or gold and silver jewelry.",
  "The second day is Chhoti Diwali or Naraka Chaturdashi, celebrated with an auspicious pre-dawn herbal oil bath called Abhyanga Snan.",
  "Lakshmi Puja on the main evening invites blessings of abundance, spiritual wisdom, peace, and good health into homes and businesses.",
  "Govardhan Puja commemorates Lord Krishna lifting Mount Govardhan on his finger to shelter villagers and animals from relentless storms.",
  "Bhai Dooj celebrates the bond of love and protection between siblings, where sisters pray for their brothers' long lives and happiness.",
  "Newari Buddhists in Nepal observe Diwali as Tihar, honoring crows, dogs, and cows across different days of the festival.",
  "Traditional Diwali sweets include kaju katli, laddoos, and gulab jamun, lovingly shared with neighbours and friends to sweeten relationships.",
  "Diwali marks the start of the traditional Hindu financial new year, celebrated with Chopda Pujan to bless new accounting books.",
  "Rangoli patterns traditionally used rice flour, turmeric, and dried petals, which also provided nourishing food for passing birds and ants.",
  "The flame of a diya always points upward, reminding us to keep our thoughts elevated and strive toward higher wisdom.",
  "In West Bengal, Assam, and Odisha, the night of Diwali is dedicated to the fierce and protective worship of Goddess Kali.",
  "Marigold garlands strung across doorways during Diwali symbolize auspicious energy, solar warmth, and divine blessings for entering visitors.",
  "Lighting a row of lamps along roofs and parapets is believed to guide visiting ancestors and deities with gentle golden warmth.",
  "The sound of crackers and bells was traditionally believed to dispel negative vibrations and stir dormant joy in the community.",
  "In Maharashtra, children build miniature mud forts called 'kille' to honor the legacy and courage of warrior king Chhatrapati Shivaji.",
  "The festival reminds us that just as one small lamp can banish complete darkness, one kind deed brings hope to many."
]

export class FactBag {
  constructor() {
    this.remaining = []
    this.history = []
  }

  next() {
    if (this.remaining.length === 0) {
      // Re-fill and Fisher-Yates shuffle
      this.remaining = [...FACTS]
      for (let i = this.remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = this.remaining[i]
        this.remaining[i] = this.remaining[j]
        this.remaining[j] = temp
      }
      // If we had a previous last fact and the new first fact is the same, swap it if length > 1
      if (this.history.length > 0 && this.remaining[0] === this.history[this.history.length - 1] && this.remaining.length > 1) {
        const swapIdx = 1 + Math.floor(Math.random() * (this.remaining.length - 1))
        const temp = this.remaining[0]
        this.remaining[0] = this.remaining[swapIdx]
        this.remaining[swapIdx] = temp
      }
    }
    const item = this.remaining.pop()
    this.history.push(item)
    return item
  }
}

