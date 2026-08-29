type Command =
  | string
  | {
      name: string;
      description?: string | string[];
    };

interface RankInfo {
  color: string;
  chatColor: string;
  stars: number;
  rarity: string;
  shortDescription: string;
  highlights: string[];
  benefits: {
    comandos: Command[];
    economia: string[];
    extras: string[];
  };
}

export const rankData: Record<string, RankInfo> = {
  Platino: {
    color: "#d7dde2",
    chatColor: "#d7dde2",
    stars: 1,
    rarity: "Común",

    shortDescription: "Ideal para comenzar tu aventura VIP.",

    highlights: [
      "Kit Platino",
      "20.000 monedas",
      "Prefijo exclusivo",
    ],

    benefits: {
      comandos: [
        "/shop",
        "/hat",
        "/workbench",
        "/feed",
      ],

      economia: [
        "20.000 monedas",
      ],

      extras: [
        "Prefijo exclusivo en toda la Network (TAB y CHAT).",
        "Kit Platino de bienvenida (entrega única).",
        "Llaves de bienvenida:",
        "• x1 Aldeana",
        "• x1 Imperial",
        "• x1 Arcana",
        "• x1 Divina",
        "• x1 Oni",
        "Todos los comandos poseen tiempo de reutilización (cooldown).",
      ],
    },
  },

  Paladio: {
    color: "#ff8c32",
    chatColor: "#ff8c32",
    stars: 2,
    rarity: "Raro",

    shortDescription: "Más beneficios y una mejor experiencia.",

    highlights: [
      "Kit Paladio",
      "45.000 monedas",
      "Prefijo exclusivo",
    ],

    benefits: {
      comandos: [
        "/shop",
        "/hat",
        "/workbench",
        "/feed",
        "/enderchest",
      ],

      economia: [
        "45.000 monedas",
      ],

      extras: [
        "Incluye todos los beneficios del rango Platino, excepto kits, saldos y llaves de bienvenida.",
        "Prefijo exclusivo en toda la Network (TAB y CHAT).",
        "Kit Paladio de bienvenida (entrega única).",
        "Llaves de bienvenida:",
        "• x3 Aldeana",
        "• x2 Imperial",
        "• x1 Arcana",
        "• x1 Divina",
        "• x1 Oni",
        "Todos los comandos poseen tiempo de reutilización (cooldown).",
      ],
    },
  },

  Mithril: {
    color: "#4de3ff",
    chatColor: "#4de3ff",
    stars: 3,
    rarity: "Épico",

    shortDescription: "Un rango pensado para jugadores dedicados.",

    highlights: [
      "Kit Mithril",
      "100.000 monedas",
      "Prefijo exclusivo",
    ],

    benefits: {
      comandos: [
        "/shop",
        "/hat",
        "/workbench",
        "/enderchest",
        "/top",
        {
          name: "/near",
          description: "200 bloques de alcance máximo.",
        },
      ],

      economia: [
        "100.000 monedas",
      ],

      extras: [
        "Incluye todos los beneficios del rango Paladio, excepto kits, saldos y llaves de bienvenida.",
        "Prefijo exclusivo en toda la Network (TAB y CHAT).",
        "Kit Mithril de bienvenida (entrega única).",
        "Llaves de bienvenida:",
        "• x5 Aldeana",
        "• x3 Imperial",
        "• x2 Arcana",
        "• x1 Divina",
        "• x1 Oni",
        "Todos los comandos poseen tiempo de reutilización (cooldown).",
      ],
    },
  },

  Titanio: {
    color: "#7f63ff",
    chatColor: "#7f63ff",
    stars: 4,
    rarity: "Legendario",

    shortDescription: "Poder, comodidad y ventajas avanzadas.",

    highlights: [
      "Kit Titanio",
      "160.000 monedas",
      "Prefijo exclusivo",
    ],

    benefits: {
      comandos: [
        "/shop",
        "/hat",
        "/workbench",
        "/enderchest",
        "/top",
        {
          name: "/near",
          description: "100 bloques de alcance máximo.",
        },
        {
          name: "/repair",
          description: [
            "Repara 1 objeto.",
            "Costo por uso: 25.000 monedas.",
            "Tiempo de reutilización: 24 horas.",
          ],
        },
      ],

      economia: [
        "160.000 monedas",
      ],

      extras: [
        "Incluye todos los beneficios del rango Mithril, excepto kits, saldos y llaves de bienvenida.",
        "Prefijo exclusivo en toda la Network (TAB y CHAT).",
        "Kit Titanio de bienvenida (entrega única).",
        "Llaves de bienvenida:",
        "• x7 Aldeana",
        "• x4 Imperial",
        "• x3 Arcana",
        "• x1 Divina",
        "• x1 Oni",
        "Todos los comandos poseen tiempo de reutilización (cooldown), excepto los comandos de teletransporte.",
      ],
    },
  },

  Luminita: {
    color: "#00a86b",
    chatColor: "#00a86b",
    stars: 5,
    rarity: "Supremo",

    shortDescription: "El máximo rango disponible en Koshi Village.",

    highlights: [
      "Kit Luminita",
      "230.000 monedas",
      "Prefijo supremo",
    ],

    benefits: {
      comandos: [
        "/shop",
        "/hat",
        "/workbench",
        "/enderchest",
        "/top",
        {
          name: "/near",
          description: "100 bloques de alcance máximo.",
        },
        {
          name: "/repair",
          description: [
            "Repara 1 objeto.",
            "Costo por uso: 25.000 monedas.",
            "Tiempo de reutilización: 24 horas.",
          ],
        },
      ],

      economia: [
        "230.000 monedas",
      ],

      extras: [
        "Incluye todos los beneficios del rango Titanio, excepto kits, saldos y llaves de bienvenida.",
        "Prefijo exclusivo en toda la Network (TAB y CHAT).",
        "Kit Luminita de bienvenida (entrega única).",
        "Llaves de bienvenida:",
        "• x10 Aldeana",
        "• x5 Imperial",
        "• x4 Arcana",
        "• x2 Divina",
        "• x1 Oni",
        "Todos los comandos poseen tiempo de reutilización (cooldown).",
      ],
    },
  },
};
