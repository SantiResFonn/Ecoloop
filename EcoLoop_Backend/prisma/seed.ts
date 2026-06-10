import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando siembra de base de datos (seeding)...");

  // Limpiar base de datos
  console.log("🧹 Limpiando tablas existentes...");
  await prisma.quiz_completions.deleteMany();
  await prisma.quiz_questions.deleteMany();
  await prisma.quizzes.deleteMany();
  await prisma.redemptions.deleteMany();
  await prisma.transactions.deleteMany();
  await prisma.news_articles.deleteMany();
  await prisma.products.deleteMany();
  await prisma.waste_bins.deleteMany();
  await prisma.waste_stations.deleteMany();
  await prisma.profiles.deleteMany();

  // 1. Crear Perfiles (Usuarios con diferentes roles)
  console.log("👤 Creando perfiles de usuario...");
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash("password123", saltRounds);

  const adminUser = await prisma.profiles.create({
    data: {
      email: "admin@ecoloop.com",
      password_hash: passwordHash,
      full_name: "Administrador de EcoLoop",
      role: "admin",
      eco_points: 0,
    },
  });

  const workerUser = await prisma.profiles.create({
    data: {
      email: "worker@ecoloop.com",
      password_hash: passwordHash,
      full_name: "Operario Juan",
      role: "worker",
      eco_points: 0,
    },
  });

  const standardUser = await prisma.profiles.create({
    data: {
      email: "user@ecoloop.com",
      password_hash: passwordHash,
      full_name: "María Pérez",
      role: "user",
      eco_points: 150, // Puntos iniciales para pruebas de canje
    },
  });

  console.log(`- Creado Administrador: ${adminUser.email}`);
  console.log(`- Creado Trabajador: ${workerUser.email}`);
  console.log(`- Creado Usuario: ${standardUser.email}`);

  // 2. Crear Estaciones de Reciclaje
  console.log("🏢 Creando estaciones de reciclaje...");
  const stationA = await prisma.waste_stations.create({
    data: {
      name: "Estación Principal (Edificio A)",
      location: "Edificio A - Planta Baja Pasillo Central",
      description: "Estación con gran flujo de estudiantes y tres contenedores.",
    },
  });

  const stationB = await prisma.waste_stations.create({
    data: {
      name: "Estación de la Cafetería (Edificio B)",
      location: "Edificio B - Entrada Exterior Cafetería",
      description: "Estación optimizada para residuos orgánicos de comida.",
    },
  });

  console.log(`- Creada estación: ${stationA.name}`);
  console.log(`- Creada estación: ${stationB.name}`);

  // 3. Crear Contenedores (Waste Bins) con códigos QR únicos
  console.log("🗑️ Creando contenedores y códigos QR...");
  const binA1 = await prisma.waste_bins.create({
    data: {
      station_id: stationA.id,
      waste_type: "recyclable",
      capacity_percentage: 25,
      needs_attention: false,
      qr_code: "QR_STATION1_REC",
    },
  });

  const binA2 = await prisma.waste_bins.create({
    data: {
      station_id: stationA.id,
      waste_type: "organic",
      capacity_percentage: 40,
      needs_attention: false,
      qr_code: "QR_STATION1_ORG",
    },
  });

  const binA3 = await prisma.waste_bins.create({
    data: {
      station_id: stationA.id,
      waste_type: "non_recyclable",
      capacity_percentage: 85,
      needs_attention: true, // Alerta
      qr_code: "QR_STATION1_NON",
    },
  });

  const binB1 = await prisma.waste_bins.create({
    data: {
      station_id: stationB.id,
      waste_type: "organic",
      capacity_percentage: 95,
      needs_attention: true, // Alerta por capacidad casi llena
      qr_code: "QR_STATION2_ORG",
    },
  });

  const binB2 = await prisma.waste_bins.create({
    data: {
      station_id: stationB.id,
      waste_type: "recyclable",
      capacity_percentage: 15,
      needs_attention: false,
      qr_code: "QR_STATION2_REC",
    },
  });

  console.log(`- Contenedores creados en ${stationA.name} (Reciclable, Orgánico, No reciclable)`);
  console.log(`- Contenedores creados en ${stationB.name} (Orgánico, Reciclable)`);

  // 4. Crear Productos (Premios de Canje)
  console.log("🎁 Creando productos de la EcoTienda...");
  const notebook = await prisma.products.create({
    data: {
      name: "Cuaderno Ecológico Hojas Fibra de Caña",
      description: "Cuaderno de 100 hojas elaborado 100% con bagazo de caña de azúcar sin blanquear.",
      points_cost: 50,
      stock: 35,
      category: "Papelería",
      is_available: true,
      image_url: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80",
    },
  });

  const bottle = await prisma.products.create({
    data: {
      name: "Termo de Acero Reutilizable 750ml",
      description: "Termo resistente para líquidos fríos o calientes que reduce el uso de botellas plásticas.",
      points_cost: 90,
      stock: 20,
      category: "Hogar",
      is_available: true,
      image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80",
    },
  });

  const bag = await prisma.products.create({
    data: {
      name: "Bolsa de Algodón Orgánico EcoLoop",
      description: "Bolsa resistente de tela para compras con estampado de tintas vegetales.",
      points_cost: 30,
      stock: 100,
      category: "Accesorios",
      is_available: true,
      image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80",
    },
  });

  const unavailableProduct = await prisma.products.create({
    data: {
      name: "Cargador Solar Portátil para Celular",
      description: "Cargador solar resistente al agua. Agotado temporalmente.",
      points_cost: 250,
      stock: 0,
      category: "Tecnología",
      is_available: false,
      image_url: "https://images.unsplash.com/photo-1608976077583-bf9c5651c6c0?w=400&q=80",
    },
  });

  console.log(`- Creados productos: ${notebook.name}, ${bottle.name}, ${bag.name}`);

  // 5. Crear Artículos de Noticias/Blog
  console.log("📰 Creando artículos educativos...");
  await prisma.news_articles.create({
    data: {
      title: "Guía Básica: ¿Cómo separar los residuos correctamente?",
      content: `Separar los residuos en la fuente es el paso más importante para garantizar un reciclaje efectivo. En EcoLoop dividimos la clasificación en tres contenedores primordiales:
      
1. **Contenedor Reciclable (Azul/Verde)**: Aquí depositamos papel limpio, cartón seco, botellas plásticas (PET), envases de vidrio y latas de aluminio. Asegúrate de que estén limpios de comida y secos para no dañar otros materiales.
2. **Contenedor Orgánico (Verde/Café)**: Diseñado para residuos biodegradables de comida, cáscaras de frutas y verduras, restos de café y hojas secas. Estos residuos se transforman en compostaje para abono.
3. **Contenedor No Reciclable (Negro)**: Residuos higiénicos, servilletas usadas, envolturas de golosinas metalizadas, icopor y cartón engrasado con comida.

¡Juntos podemos reducir significativamente los desechos que terminan en los rellenos sanitarios!`,
      image_url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
      published: true,
      author_id: adminUser.id,
    },
  });

  await prisma.news_articles.create({
    data: {
      title: "El impacto del plástico de un solo uso en nuestro campus",
      content: `Cada día se consumen miles de botellas y vasos de plástico en nuestras cafeterías. La mayoría termina en la basura ordinaria debido a la contaminación con grasas y líquidos.
      
Al llevar tu propio termo de acero inoxidable reutilizable y usar bolsas de tela, evitas generar decenas de kilos de plástico al año. En la EcoTienda de EcoLoop puedes canjear tus puntos acumulados por termos y bolsas ecológicas elaboradas bajo procesos sostenibles.
      
¡Usa tus puntos para hacer el cambio hoy mismo!`,
      image_url: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&q=80",
      published: true,
      author_id: adminUser.id,
    },
  });

  console.log("- Creadas noticias educativas");

  // 6. Crear Quizzes Educativos
  console.log("🧠 Creando cuestionarios interactivos...");
  const quiz1 = await prisma.quizzes.create({
    data: {
      title: "Cuestionario: Fundamentos del Reciclaje",
      description: "Pon a prueba tus conocimientos sobre la separación de residuos y gana puntos ecológicos extra.",
      points_reward: 20,
      is_active: true,
    },
  });

  await prisma.quiz_questions.createMany({
    data: [
      {
        quiz_id: quiz1.id,
        question: "¿Qué contenedor de EcoLoop se debe usar para desechar una botella plástica de gaseosa limpia y aplastada?",
        correct_answer: "Reciclable (recyclable)",
        wrong_answer_1: "Orgánico (organic)",
        wrong_answer_2: "No reciclable (non_recyclable)",
        wrong_answer_3: "Ninguno de los anteriores",
        order_index: 1,
      },
      {
        quiz_id: quiz1.id,
        question: "¿Cuál de los siguientes residuos se clasifica como orgánico?",
        correct_answer: "Cáscaras de plátano y restos de comida",
        wrong_answer_1: "Servilletas usadas y papel higiénico",
        wrong_answer_2: "Vasos de icopor",
        wrong_answer_3: "Latas de gaseosa vacías",
        order_index: 2,
      },
      {
        quiz_id: quiz1.id,
        question: "¿Por qué es importante lavar ligeramente los recipientes de plástico o vidrio antes de depositarlos en el contenedor de reciclaje?",
        correct_answer: "Para evitar la contaminación por restos orgánicos que dañan el material reciclable",
        wrong_answer_1: "Para que pesen más y nos den más puntos",
        wrong_answer_2: "Para que brillen más en el contenedor",
        wrong_answer_3: "No es necesario lavarlos",
        order_index: 3,
      },
    ],
  });

  console.log(`- Creado quiz: ${quiz1.title} con 3 preguntas.`);

  console.log("🏁 ¡Base de datos sembrada con éxito (seeding completed)! 🌱");
}

main()
  .catch((e) => {
    console.error("❌ Error al sembrar la base de datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
