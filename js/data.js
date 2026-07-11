/**
 * Core Data Map containing structural character data.
 */
const AMHARIC_ALPHABET = [
  {
    id: "ha_1",
    letter: "ሀ",
    pronunciation: "Ha",
    exampleWord: "ሀረግ",
    exampleMeaning: "Vine",
    exampleGraphic: "🌿",
    strokes: [
      [
        { x: 80, y: 80 },
        { x: 240, y: 80 },
      ], // Top line path horizontal layout
      [
        { x: 160, y: 80 },
        { x: 160, y: 240 },
      ], // Center stem vertical down path
    ],
  },
  {
    id: "le_1",
    letter: "ለ",
    pronunciation: "Le",
    exampleWord: "ለሊት",
    exampleMeaning: "Night",
    exampleGraphic: "🌙",
    strokes: [
      [
        { x: 100, y: 80 },
        { x: 100, y: 240 },
      ],
      [
        { x: 220, y: 80 },
        { x: 220, y: 240 },
      ],
      [
        { x: 100, y: 160 },
        { x: 220, y: 160 },
      ],
    ],
  },
  {
    id: "me_1",
    letter: "መ",
    pronunciation: "Me",
    exampleWord: "መኪና",
    exampleMeaning: "Car",
    exampleGraphic: "🚗",
    strokes: [
      [
        { x: 80, y: 80 },
        { x: 80, y: 240 },
      ],
      [
        { x: 80, y: 80 },
        { x: 240, y: 80 },
      ],
      [
        { x: 240, y: 80 },
        { x: 240, y: 240 },
      ],
      [
        { x: 80, y: 160 },
        { x: 240, y: 160 },
      ],
    ],
  },
  {
    id: "se_1",
    letter: "ሰ",
    pronunciation: "Se",
    exampleWord: "ሰዓት",
    exampleMeaning: "Clock",
    exampleGraphic: "⏰",
    strokes: [
      [
        { x: 100, y: 80 },
        { x: 100, y: 240 },
      ],
      [
        { x: 100, y: 80 },
        { x: 220, y: 140 },
      ],
      [
        { x: 220, y: 140 },
        { x: 220, y: 240 },
      ],
    ],
  },
];
