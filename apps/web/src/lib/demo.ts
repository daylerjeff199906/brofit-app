import type { Gym, Plan } from "@brofit/types";
export const gyms: Gym[] = [
  {
    id: "demo-01",
    slug: "concreto-club",
    name: "Concreto Club",
    district: "Miraflores",
    address: "Dirección ficticia · zona de Miraflores, Lima",
    category: "Musculación",
    equipment: ["Pesas libres", "Máquinas", "Rack de sentadillas"],
    services: ["Duchas", "Lockers"],
    price: 25,
    hours: "Lun–Vie 06:00–22:00 · Sáb 07:00–18:00",
    image: "/images/gym-1.jpg",
    description:
      "Hierro, espacio y ganas. Un ambiente de ejemplo para quienes disfrutan entrenar fuerza a su propio ritmo.",
    demo: true,
  },
  {
    id: "demo-02",
    slug: "movimiento-studio",
    name: "Movimiento Studio",
    district: "Barranco",
    address: "Dirección ficticia · zona de Barranco, Lima",
    category: "Funcional",
    equipment: ["Kettlebells", "TRX", "Pesas libres"],
    services: ["Duchas", "Lockers"],
    price: 30,
    hours: "Lun–Sáb 07:00–21:00",
    image: "/images/gym-2.jpg",
    description:
      "Un espacio de ejemplo para moverte diferente: entrenamiento funcional, movilidad y circuitos.",
    demo: true,
  },
  {
    id: "demo-03",
    slug: "norte-fuerza",
    name: "Norte Fuerza",
    district: "San Isidro",
    address: "Dirección ficticia · zona de San Isidro, Lima",
    category: "Musculación",
    equipment: ["Máquinas", "Pesas libres", "Bicicletas"],
    services: ["Duchas", "Estacionamiento"],
    price: 35,
    hours: "Lun–Vie 05:30–23:00 · Sáb 07:00–19:00",
    image: "/images/gym-3.jpg",
    description:
      "Una propuesta de ejemplo con máquinas y zona de peso libre para encontrar tu siguiente desafío.",
    demo: true,
  },
  {
    id: "demo-04",
    slug: "ritmo-training",
    name: "Ritmo Training",
    district: "Surco",
    address: "Dirección ficticia · zona de Surco, Lima",
    category: "Cardio",
    equipment: ["Caminadoras", "Bicicletas", "TRX"],
    services: ["Lockers", "Estacionamiento"],
    price: 20,
    hours: "Lun–Sáb 06:00–21:00",
    image: "/images/gym-2.jpg",
    description:
      "Un gimnasio ficticio para descubrir sesiones de cardio y movimiento a tu manera.",
    demo: true,
  },
];
export const plans: Plan[] = [
  {
    id: "demo-day",
    name: "Un día. Tu elección.",
    price: 25,
    visits: 1,
    days: 7,
    description: "Prueba un espacio nuevo con un pase individual.",
    conditions: [
      "1 visita a un gimnasio seleccionado",
      "Vigencia: 7 días desde la emisión",
      "Ingreso dentro del horario del gimnasio",
      "Precio referencial; varía según gimnasio",
    ],
    demo: true,
  },
  {
    id: "demo-flex",
    name: "Más lugares. Más tú.",
    price: 129,
    visits: 8,
    days: 30,
    description:
      "Una membresía para cambiar de espacio sin cambiar de objetivo.",
    conditions: [
      "8 visitas en 30 días desde la activación",
      "Elegibles: los 4 gimnasios DEMO del catálogo",
      "Máximo 1 visita por día; hasta 4 por gimnasio",
      "Visitas no acumulables; sin renovación automática",
    ],
    demo: true,
  },
];
export const faqs = [
  [
    "¿Qué es BROFIT — ya?",
    "Una plataforma para descubrir gimnasios y acceder con pases individuales o membresías con un número definido de visitas. Esta versión es una demostración navegable.",
  ],
  [
    "¿Necesito una membresía para entrenar?",
    "Puedes elegir un pase individual. La membresía multigimnasio es una alternativa con visitas y vigencia definidas.",
  ],
  [
    "¿Puedo entrenar en cualquier gimnasio?",
    "Solo en establecimientos elegibles para tu pase o plan. El catálogo actual contiene ejemplos ficticios, no gimnasios afiliados.",
  ],
  [
    "¿Cómo ingreso al gimnasio?",
    "Tras una compra sandbox se emite un pase de prueba. Genera un QR temporal en Mis pases y presenta el código en recepción. El gimnasio lo valida en el servidor y se descuenta una sola visita.",
  ],
  [
    "¿Tengo que compartir mi ubicación?",
    "No. Puedes explorar y filtrar por distrito sin activar la ubicación precisa.",
  ],
];
