export default {
  "_credit": "JSON shape after gd_dialog by Qin Tina (MIT). Lines are original Johansson Town writing.",
  "thuan_start": {
    "name": "Thuan",
    "icon": "thuan",
    "voice": "thuan",
    "text": [
      "いらっしゃいませ！ トゥアンです。",
      "Welcome! I am Thuan. I keep Sakura stocked, the plants alive, and the radio just loud enough to sing along."
    ],
    "next": "thuan_menu",
    "action": ["note Met Thuan, the heart of Sakura Konbini.", "flag met_thuan"]
  },
  "thuan_return": {
    "name": "Thuan",
    "voice": "thuan",
    "text": ["おかえり！", "You are back! Welcome to Sakura. Looking for a snack, or shall we make the afternoon a little less ordinary?"],
    "next": "thuan_menu"
  },
  "thuan_menu": {
    "name": "Thuan",
    "voice": "thuan",
    "text": ["What brings you in?"],
    "choices": [
      { "text": "What is your favourite snack?", "next": "thuan_snack" },
      { "text": "I like your ribbon", "next": "thuan_ribbon" },
      { "text": "Where do you go after work?", "next": "thuan_town" },
      { "text": "You make this place lovely", "next": "thuan_compliment" },
      { "text": "Give me a little challenge", "next": "thuan_challenge" },
      { "text": "Tell me a shop secret", "next": "thuan_secret" },
      { "text": "I printed something for the shop", "next": "thuan_print", "show_only_if": "flag printed model" },
      { "text": "See you soon, Thuan", "next": "thuan_bye" }
    ]
  },
  "thuan_snack": {
    "name": "Thuan",
    "text": ["おすすめ？ 任せて！", "My recommendation? Tea and a biscuit. The tea makes it a sensible decision. The biscuit makes it a good one."],
    "next": "thuan_menu"
  },
  "thuan_ribbon": {
    "name": "Thuan",
    "text": ["このリボン？", "This ribbon? I tied it three times this morning. Effortlessly charming takes a surprising amount of effort."],
    "next": "thuan_menu"
  },
  "thuan_town": {
    "name": "Thuan",
    "text": ["夕方の港が好き。", "Sakura closes at eight. I walk to the Harbour Line terminal and take the last bus after my shift."],
    "next": "thuan_menu"
  },
  "thuan_compliment": {
    "name": "Thuan",
    "text": ["もう、照れちゃう。", "Oh, now you have made me shy. I was trying to look very professional behind this counter."],
    "next": "thuan_menu"
  },
  "thuan_challenge": {
    "name": "Thuan",
    "text": ["勝負しよう！", "Find the strangest postcard on the rack. I will defend the seagull one."],
    "action": ["flag thuan_challenge"],
    "next": "thuan_menu"
  },
  "thuan_secret": {
    "name": "Thuan",
    "text": ["ここだけの話ね。", "A little shop secret: I name the plants. The stubborn one by the door is the assistant manager."],
    "next": "thuan_menu"
  },
  "thuan_print": {
    "name": "Thuan",
    "text": ["You brought a printed piece? Leave it on the counter when I am on till, nine till eight. The shop ledger keeps the yen honest."],
    "next": "thuan_menu"
  },
  "thuan_bye": {
    "name": "Thuan",
    "text": ["また来てね。", "Come back when the radio finds a better song."]
  },
  "kenji_start": {
    "name": "Kenji",
    "icon": "kenji",
    "voice": "kenji",
    "text": ["Yo bro. Workshop is open. Form 3D is on the bench if you want to print."],
    "choices": [
      { "text": "How does the printer work?", "next": "kenji_printer" },
      { "text": "Show me the workshop", "next": "kenji_escort", "show_only_if": "flag kenji_escort" },
      { "text": "See you soon", "next": "kenji_bye" }
    ]
  },
  "kenji_printer": {
    "name": "Kenji",
    "text": ["Pick a pattern on the Form 3D machine. StepWise checks the material cost and what Thuan will pay. Start the print, let it run, collect it. One of each in your bag."],
    "next": "kenji_start"
  },
  "kenji_escort": {
    "name": "Kenji",
    "text": ["Come on, bro. I’ll show you the way."],
    "action": ["escort kenji"]
  },
  "kenji_bye": {
    "name": "Kenji",
    "text": ["Later, bro."]
  }
};
