import React, { createContext, useContext, useState, useEffect } from "react";

export type Lang = "EN" | "KZ" | "RU";

interface LanguageContextType {
  language: Lang;
  setLanguage: (lang: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<Lang, Record<string, string>> = {
  EN: {
    // Common
    logo_title: "Aibi",
    nav_home: "Home",
    nav_subjects: "Subjects",
    nav_practice: "Practice",
    nav_progress: "Progress",
    nav_reports: "Reports",
    nav_notifications: "Notifications",
    nav_sign_in: "Sign In",
    nav_close_menu: "Close menu",
    nav_open_menu: "Open menu",

    // Landing Page
    hero_tagline: "For Every Ambitious Student",
    hero_title_1: "Build Your Path to ",
    hero_title_2: " Success",
    hero_desc:
      "Personalized AI preparation for every student preparing for NIS, BIL, and NSPM. Turn your potential into achievement with diagnostics, study plans, and step-by-step AI support.",
    hero_btn_diagnostic: "Start Your Free Diagnostic",
    hero_btn_video: "Watch How It Works",
    stats_transform_val: "32%",
    stats_transform_lbl: "Score Transformation",
    stats_transform_desc: "Average improvement in critical thinking and logic scores.",
    stats_path_val: "90-Day",
    stats_path_lbl: "Focused Path",
    stats_path_desc: "The optimal timeline for consistent, sustainable learning growth.",
    stats_learners_val: "12,400+",
    stats_learners_lbl: "Learners Guided",
    stats_learners_desc: "Helping students from every background reach their full potential.",
    features_title_1: "Smarter Learning, ",
    features_title_2: "Faster Results",
    features_desc:
      "Our AI-driven platform adapts to your unique learning style, making preparation efficient and engaging. Move beyond standard templates.",
    feat_diagnostics_title: "AI-Powered Diagnostics",
    feat_diagnostics_desc:
      "Identify your strengths and pinpoint knowledge gaps instantly. We create a baseline to measure your real progress with sophisticated accuracy.",
    feat_plans_title: "Personalized Study Plans",
    feat_plans_desc:
      "A dynamic roadmap that adapts to your pace and goals, ensuring you're always studying the right material at the right time.",
    feat_errors_title: "Smart Mistake Analysis",
    feat_errors_desc:
      "Learn from every error with step-by-step guidance and AI-generated similar questions to ensure true comprehension. Our system doesn't just correct you; it teaches you how to think.",
    vision_title_1: "Prepare for the Schools of Tomorrow, ",
    vision_title_2: "Today",
    vision_desc:
      "Join the next generation of leaders and innovators at NIS, BIL, and NSPM. Aibi connects each student's current level with the skills needed for selective school exams.",
    vision_btn_stories: "View Success Stories",
    cta_title: "Ready to Start Your Journey?",
    cta_desc:
      "Take the first step towards your NIS or BIL dream today with our sophisticated AI platform.",
    footer_desc: "AI preparation for every student. Intelligent, adaptive, and human-centric.",
    footer_rights: "© 2024 Aibi Inc.",
    footer_for_parents: "For Parents",
    footer_success_stories: "Success Stories",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Service",

    // Home Dashboard
    home_title: "Home — Aibi",
    home_meta_desc: "Your Aibi readiness, today's plan, and weak topic focus.",
    home_readiness_title: "NIS/BIL/NSPM Readiness",
    home_readiness_desc: "You are on track. Keep it up!",
    home_readiness_val: "Ready",
    home_readiness_btn: "Practice Natural Science & Math",
    home_plan_title: "Today's Plan",
    home_plan_view_all: "View All",
    home_task1_title: "NIS: Quantitative Characteristics",
    home_task1_sub: "Math & Logic Analysis",
    home_task2_title: "BIL: Reading Literacy",
    home_task2_sub: "Kazakh & Russian Comprehension",
    home_task3_title: "NSPM: Math & Logic",
    home_task3_sub: "Specialized Practice",
    home_exam_title: "Next Mock Exam",
    home_exam_time: "Saturday, 10 AM",
    home_exam_desc: "Full-length practice test.",
    home_focus_title: "Needs Focus",
    home_focus_topic: "Logic Problems",
    home_focus_desc: "Accuracy is below 50% in recent quizzes.",
    home_focus_btn: "Review Topic",

    // Study Plan
    plan_title: "Personalized Study Plan — Aibi",
    plan_meta_desc: "Your weekly Aibi study plan, adapted to your strengths and gaps.",
    plan_header: "Your Path to Success",
    plan_subheader: "Week 3 • Focus: Logical Reasoning",
    plan_insight_title: "Coach Insight",
    plan_insight_desc:
      "You did great on Percentages last week! This week, we'll focus a bit more on Logic Patterns to strengthen your problem-solving skills.",
    plan_mon_track: "Monday • NIS",
    plan_mon_title: "Natural Science",
    plan_mon_desc: "Review biology and physics fundamentals for the NIS entrance exam.",
    plan_tue_track: "Tuesday • NSPM",
    plan_tue_title: "Math & Logic",
    plan_tue_desc: "Advanced problem solving and logical sequences for NSPM specialization.",
    plan_wed_track: "Wednesday • BIL",
    plan_wed_title: "Reading Literacy",
    plan_wed_desc: "Critical analysis of texts and comprehension strategies for BIL exams.",
    plan_thu_track: "Thursday • NIS",
    plan_thu_title: "English & Kazakh",
    plan_thu_desc: "Grammar and vocabulary practice for English, Kazakh, and Russian subjects.",
    plan_fri_track: "Friday • NIS",
    plan_fri_title: "Quantitative",
    plan_fri_desc: "Data interpretation and quantitative reasoning for the NIS track.",
    plan_weekend_track: "Weekend",
    plan_weekend_title: "Mock Exam",
    plan_weekend_desc:
      "Full-length practice test covering all exam sections under timed conditions.",
    plan_btn_continue: "Continue",
    plan_btn_start: "Start",

    // Progress Page
    prog_title: "My Progress — Aibi",
    prog_meta_desc:
      "Weekly accuracy, time spent, and subject status across NIS, BIL & NSPM tracks.",
    prog_header: "My Progress",
    prog_subheader: "You're doing great! Keep up the good work.",
    prog_insight_title: "Insight",
    prog_insight_desc:
      "Your English and Natural Science scores are excellent. Focusing on Logic and Quantitative Characteristics will help you excel in the NSPM and NIS tracks.",
    prog_lessons_title: "Weekly Lessons",
    prog_lessons_completed: "Completed",
    prog_lessons_btn: "Start Next Lesson",
    prog_nis_track: "NIS Track",
    prog_nspm_track: "NSPM Track",
    prog_bil_track: "BIL Track",
    prog_improving: "Improving",
    prog_strong: "Strong",
    prog_needs_practice: "Needs Practice",
    prog_sub_nat_sci: "Natural Science",
    prog_sub_english: "English",
    prog_sub_logic: "Logic",
    prog_sub_logic_desc: "Focusing on pattern recognition will boost your score here.",
    prog_accuracy_title: "Accuracy Trend",
    prog_time_title: "Time Spent Studying",
    prog_time_hrs: "hrs",
    prog_time_this_week: "This week",
    prog_mon: "Mon",
    prog_tue: "Tue",
    prog_wed: "Wed",
    prog_thu: "Thu",
    prog_fri: "Fri",

    // Diagnostic Page
    diag_title: "Find Your Level — Aibi",
    diag_meta_desc:
      "Take the Aibi diagnostic to find your level across NIS, BIL, and NSPM subjects.",
    diag_back: "Go back",
    diag_header: "Find Your Level",
    diag_progress_lbl: "Diagnostic Progress",
    diag_insight_desc:
      "AI will analyze your answers to find your strong and weak topics. Don't worry if it gets hard!",
    diag_nis_subtitle: "Nazarbayev Intellectual Schools",
    diag_nspm_subtitle: "Physics & Math Schools",
    diag_bil_subtitle: "Bilim-Innovation Lyceums",
    diag_sub_nat_sci: "Natural Science",
    diag_sub_languages: "Languages (EN, KZ, RU)",
    diag_sub_quant: "Quantitative Characteristics",
    diag_sub_math: "Mathematics",
    diag_sub_logic: "Logic",
    diag_sub_reading: "Reading Literacy",
    diag_btn_start: "Start Diagnostic Test",
    diag_time_desc: "Takes about 15–20 minutes",
  },
  KZ: {
    // Common
    logo_title: "Aibi",
    nav_home: "Басты бет",
    nav_subjects: "Пәндер",
    nav_practice: "Тәжірибе",
    nav_progress: "Ілгерілеу",
    nav_reports: "Есептер",
    nav_notifications: "Хабарландырулар",
    nav_sign_in: "Кіру",
    nav_close_menu: "Мәзірді жабу",
    nav_open_menu: "Мәзірді ашу",

    // Landing Page
    hero_tagline: "Мақсаты бар әр оқушыға",
    hero_title_1: "Зияткерлік мектептер мен БИЛ-ге ",
    hero_title_2: " барар жолыңыз",
    hero_desc:
      "НИШ, БИЛ және РФМШ-ға дайындалатын әр оқушыға арналған дербес AI дайындық. Диагностика, оқу жоспары және қадамдық AI көмек арқылы әлеуетіңізді нәтижеге айналдырыңыз.",
    hero_btn_diagnostic: "Тегін диагностиканы бастау",
    hero_btn_video: "Қалай жұмыс істейтінін көру",
    stats_transform_val: "32%",
    stats_transform_lbl: "Ұпайларды өзгерту",
    stats_transform_desc: "Сни мен логикалық есептердегі орташа көрсеткішті жақсарту.",
    stats_path_val: "90-күн",
    stats_path_lbl: "Мақсатты жол",
    stats_path_desc: "Тұрақты әрі жүйелі оқу дамуына арналған оңтайлы мерзім.",
    stats_learners_val: "12,400+",
    stats_learners_lbl: "Қолдау алған оқушылар",
    stats_learners_desc: "Әр түрлі ортадан келген оқушыларға өз әлеуетін ашуға көмектесу.",
    features_title_1: "Ақылды оқыту, ",
    features_title_2: "жылдам нәтиже",
    features_desc:
      "Біздің AI платформамыз сіздің бірегей оқу стиліңізге бейімділіп, дайындықты тиімді және қызықты етеді. Стандартты үлгілерден асып түсіңіз.",
    feat_diagnostics_title: "AI негізіндегі диагностика",
    feat_diagnostics_desc:
      "Күшті жақтарыңызды анықтап, білімдегі олқылықтарды бірден белгілеңіз. Біз сіздің нақты прогресіңізді өлшеу үшін бастапқы деңгейді жасаймыз.",
    feat_plans_title: "Жеке оқу жоспарлары",
    feat_plans_desc:
      "Сіздің қарқыныңыз бен мақсаттарыңызға бейімделетін динамикалық жол картасы, бұл сізге қажетті уақытта дұрыс материалды оқуға кепілдік береді.",
    feat_errors_title: "Қателерді ақылды талдау",
    feat_errors_desc:
      "Толық түсінуді қамтамасыз ету үшін қадамдық нұсқаулықпен және AI жасаған ұқсас сұрақтармен әр қатеден сабақ алыңыз. Біздің жүйе сізді түзетіп қана қоймайды, ойлауды үйретеді.",
    vision_title_1: "Ертеңгі күннің мектептеріне ",
    vision_title_2: "бүгіннен дайындалыңыз",
    vision_desc:
      "Зияткерлік мектептер, БИЛ және РФМШ-дағы келесі буын көшбасшылары мен инноваторларына қосылыңыз. Aibi әр оқушының қазіргі деңгейін таңдаулы мектеп емтихандарына қажет дағдылармен байланыстырады.",
    vision_btn_stories: "Жетістік тарихын көру",
    cta_title: "Саяхатыңызды бастауға дайынсыз ба?",
    cta_desc:
      "Біздің озық AI платформамызбен бүгін Зияткерлік мектеп немесе БИЛ арманыңызға алғашқы қадам жасаңыз.",
    footer_desc:
      "Әр оқушы үшін жарқын болашаққа көпір салу. Ақылды, бейімделгіш және адамға бағытталған.",
    footer_rights: "© 2024 Aibi Inc.",
    footer_for_parents: "Ата-аналар үшін",
    footer_success_stories: "Жетістік тарихы",
    footer_privacy: "Құпиялылық саясаты",
    footer_terms: "Қызмет көрсету шарттары",

    // Home Dashboard
    home_title: "Басты бет — Aibi",
    home_meta_desc: "Сіздің дайындығыңыз, бүгінгі жоспарыңыз және әлсіз тақырыптарға назар аудару.",
    home_readiness_title: "НИШ/БИЛ/РФМШ-ға дайындық",
    home_readiness_desc: "Сіз дұрыс жолдасыз. Осылай жалғастырыңыз!",
    home_readiness_val: "Дайын",
    home_readiness_btn: "Жаратылыстану және математиканы тәжірибелеу",
    home_plan_title: "Бүгінгі жоспар",
    home_plan_view_all: "Бәрін көру",
    home_task1_title: "НИШ: Сандық сипаттамалар",
    home_task1_sub: "Математика және логикалық талдау",
    home_task2_title: "БИЛ: Оқу сауаттылығы",
    home_task2_sub: "Қазақ және орыс тілдерін түсіну",
    home_task3_title: "РФМШ: Математика және логика",
    home_task3_sub: "Мамандандырылған тәжірибе",
    home_exam_title: "Келесі байқау емтиханы",
    home_exam_time: "Сенбі, сағат 10:00",
    home_exam_desc: "Толық форматтағы тәжірибелік тест.",
    home_focus_title: "Назар аударуды қажет етеді",
    home_focus_topic: "Логикалық есептер",
    home_focus_desc: "Соңғы тесттердегі дәлдік 50%-дан төмен.",
    home_focus_btn: "Тақырыпты қайталау",

    // Study Plan
    plan_title: "Жеке оқу жоспары — Aibi",
    plan_meta_desc: "Күшті және әлсіз тұстарыңызға бейімделген апталық оқу жоспарыңыз.",
    plan_header: "Сәттілікке апарар жолыңыз",
    plan_subheader: "3-апта • Назарда: Логикалық ойлау",
    plan_insight_title: "Жаттықтырушының кеңесі",
    plan_insight_desc:
      "Өткен аптада пайыздық есептерді өте жақсы орындадыңыз! Осы аптада есептерді шешу дағдыларыңызды нығайту үшін логикалық заңдылықтарға көбірек көңіл бөлеміз.",
    plan_mon_track: "Дүйсенбі • НИШ",
    plan_mon_title: "Жаратылыстану",
    plan_mon_desc:
      "Зияткерлік мектептерге түсу емтиханы үшін биология мен физика негіздерін қайталау.",
    plan_tue_track: "Сейсенбі • РФМШ",
    plan_tue_title: "Математика және логика",
    plan_tue_desc: "РФМШ бағыты үшін күрделі есептер мен логикалық тізбектерді шешу.",
    plan_wed_track: "Сәрсенбі • БИЛ",
    plan_wed_title: "Оқу сауаттылығы",
    plan_wed_desc: "БИЛ емтихандары үшін мәтіндерді сыни талдау және түсіну стратегиялары.",
    plan_thu_track: "Бейсенбі • НИШ",
    plan_thu_title: "Ағылшын және қазақ тілдері",
    plan_thu_desc:
      "Ағылшын, қазақ және орыс тілдері бойынша грамматика мен сөздік қорды жаттықтыру.",
    plan_fri_track: "Жұма • НИШ",
    plan_fri_title: "Сандық сипаттамалар",
    plan_fri_desc: "Зияткерлік мектептер бағыты бойынша деректерді түсіндіру және сандық талдау.",
    plan_weekend_track: "Демалыс күндері",
    plan_weekend_title: "Байқау емтиханы",
    plan_weekend_desc:
      "Уақыт шектеуімен емтиханның барлық бөлімдерін қамтитын толық форматты тест.",
    plan_btn_continue: "Жалғастыру",
    plan_btn_start: "Бастау",

    // Progress Page
    prog_title: "Менің прогресім — Aibi",
    prog_meta_desc:
      "Апталық дәлдік, оқуға жұмсалған уақыт және НИШ, БИЛ мен РФМШ бағыттарындағы пән мәртебелері.",
    prog_header: "Менің прогресім",
    prog_subheader: "Сіз керемет орындап жатырсыз! Осылай жалғастыра беріңіз.",
    prog_insight_title: "Кеңес",
    prog_insight_desc:
      "Ағылшын тілі мен жаратылыстану ұпайларыңыз өте жақсы. Логика мен сандық сипаттамаларға назар аудару РФМШ және Зияткерлік мектептер бағыттарында жоғары нәтижелерге жетуге көмектеседі.",
    prog_lessons_title: "Апталық сабақтар",
    prog_lessons_completed: "Аяқталды",
    prog_lessons_btn: "Келесі сабақты бастау",
    prog_nis_track: "НИШ бағыты",
    prog_nspm_track: "РФМШ бағыты",
    prog_bil_track: "БИЛ бағыты",
    prog_improving: "Жақсаруда",
    prog_strong: "Күшті жағы",
    prog_needs_practice: "Тәжірибе қажет",
    prog_sub_nat_sci: "Жаратылыстану",
    prog_sub_english: "Ағылшын тілі",
    prog_sub_logic: "Логика",
    prog_sub_logic_desc: "Заңдылықтарды тануға назар аудару бұл бөлімдегі ұпайыңызды арттырады.",
    prog_accuracy_title: "Дәлдік тенденциясы",
    prog_time_title: "Оқуға жұмсалған уақыт",
    prog_time_hrs: "сағат",
    prog_time_this_week: "Осы аптада",
    prog_mon: "Дүй",
    prog_tue: "Сей",
    prog_wed: "Сәр",
    prog_thu: "Бей",
    prog_fri: "Жұм",

    // Diagnostic Page
    diag_title: "Өз деңгейіңізді анықтаңыз — Aibi",
    diag_meta_desc:
      "НИШ, БИЛ және РФМШ пәндері бойынша деңгейіңізді анықтау үшін Aibi диагностикасынан өтіңіз.",
    diag_back: "Артқа оралу",
    diag_header: "Өз деңгейіңізді анықтаңыз",
    diag_progress_lbl: "Диагностика прогресі",
    diag_insight_desc:
      "AI сіздің күшті және әлсіз тақырыптарыңызды табу үшін жауаптарыңызды талдайды. Қиын болса, уайымдамаңыз!",
    diag_nis_subtitle: "Назарбаев Зияткерлік мектептері",
    diag_nspm_subtitle: "Физика-математика бағытындағы мектептер",
    diag_bil_subtitle: "Білім-Инновация Лицейлері",
    diag_sub_nat_sci: "Жаратылыстану",
    diag_sub_languages: "Тілдер (EN, KZ, RU)",
    diag_sub_quant: "Сандық сипаттамалар",
    diag_sub_math: "Математика",
    diag_sub_logic: "Логика",
    diag_sub_reading: "Оқу сауаттылығы",
    diag_btn_start: "Диагностикалық тестті бастау",
    diag_time_desc: "Шамамен 15–20 минут уақыт алады",
  },
  RU: {
    // Common
    logo_title: "Aibi",
    nav_home: "Главная",
    nav_subjects: "Предметы",
    nav_practice: "Практика",
    nav_progress: "Прогресс",
    nav_reports: "Отчеты",
    nav_notifications: "Уведомления",
    nav_sign_in: "Войти",
    nav_close_menu: "Закрыть меню",
    nav_open_menu: "Открыть меню",

    // Landing Page
    hero_tagline: "Для каждого мотивированного ученика",
    hero_title_1: "Постройте свой мост к успеху в ",
    hero_title_2: " НИШ и БИЛ",
    hero_desc:
      "Персонализированная AI-подготовка для каждого ученика, который готовится к НИШ, БИЛ и РФМШ. Превратите свой потенциал в результат с диагностикой, учебным планом и пошаговой AI-помощью.",
    hero_btn_diagnostic: "Начать бесплатную диагностику",
    hero_btn_video: "Посмотреть, как это работает",
    stats_transform_val: "32%",
    stats_transform_lbl: "Трансформация баллов",
    stats_transform_desc: "Среднее улучшение показателей критического мышления и логики.",
    stats_path_val: "90 дней",
    stats_path_lbl: "Фокусный путь",
    stats_path_desc: "Оптимальные сроки для стабильного и устойчивого роста обучения.",
    stats_learners_val: "12,400+",
    stats_learners_lbl: "Ученики с поддержкой",
    stats_learners_desc: "Помощь ученикам из разных школ и городов раскрывать свой потенциал.",
    features_title_1: "Умное обучение, ",
    features_title_2: "быстрые результаты",
    features_desc:
      "Наша платформа на базе искусственного интеллекта адаптируется к вашему уникальному стилю обучения, делая подготовку эффективной и увлекательной. Выйдите за рамки стандартов.",
    feat_diagnostics_title: "Диагностика на базе AI",
    feat_diagnostics_desc:
      "Мгновенно определяйте свои сильные стороны и выявляйте пробелы в знаниях. Мы создаем базу для точного измерения вашего реального прогресса.",
    feat_plans_title: "Персональные планы обучения",
    feat_plans_desc:
      "Динамическая дорожная карта, адаптирующаяся к вашему темпу и целям, гарантируя изучение нужного материала в нужное время.",
    feat_errors_title: "Умный анализ ошибок",
    feat_errors_desc:
      "Учитесь на каждой ошибке с помощью пошаговых руководств и похожих вопросов, сгенерированных AI. Наша система не просто исправляет вас; она учит думать.",
    vision_title_1: "Готовьтесь к школам будущего уже ",
    vision_title_2: "сегодня",
    vision_desc:
      "Присоединяйтесь к следующему поколению лидеров и новаторов в НИШ, БИЛ и РФМШ. Aibi соединяет текущий уровень ученика с навыками, нужными для поступления.",
    vision_btn_stories: "Посмотреть истории успеха",
    cta_title: "Готовы начать свой путь?",
    cta_desc:
      "Сделайте первый шаг к своей мечте о НИШ или БИЛ сегодня с помощью нашей продвинутой AI-платформы.",
    footer_desc:
      "Строим мост в светлое будущее для каждого ученика. Интеллектуальный, адаптивный и человекоцентричный подход.",
    footer_rights: "© 2024 Aibi Inc.",
    footer_for_parents: "Родителям",
    footer_success_stories: "Истории успеха",
    footer_privacy: "Политика конфиденциальности",
    footer_terms: "Условия использования",

    // Home Dashboard
    home_title: "Главная — Aibi",
    home_meta_desc: "Ваша готовность, сегодняшний план и фокус на слабых темах.",
    home_readiness_title: "Готовность к НИШ/БИЛ/РФМШ",
    home_readiness_desc: "Вы на правильном пути. Так держать!",
    home_readiness_val: "Готово",
    home_readiness_btn: "Практика Естествознания и Математики",
    home_plan_title: "План на сегодня",
    home_plan_view_all: "Посмотреть все",
    home_task1_title: "НИШ: Количественные характеристики",
    home_task1_sub: "Математический и логический анализ",
    home_task2_title: "БИЛ: Читательская грамотность",
    home_task2_sub: "Понимание казахского и русского языков",
    home_task3_title: "РФМШ: Математика и логика",
    home_task3_sub: "Специализированная практика",
    home_exam_title: "Следующий пробный экзамен",
    home_exam_time: "Суббота, 10:00",
    home_exam_desc: "Полноформатный тренировочный тест.",
    home_focus_title: "Требует внимания",
    home_focus_topic: "Логические задачи",
    home_focus_desc: "Точность в последних тестах ниже 50%.",
    home_focus_btn: "Повторить тему",

    // Study Plan
    plan_title: "Персональный план обучения — Aibi",
    plan_meta_desc: "Ваш еженедельный план обучения, адаптированный к сильным и слабым сторонам.",
    plan_header: "Ваш путь к успеху",
    plan_subheader: "Неделя 3 • Фокус: Логическое мышление",
    plan_insight_title: "Совет тренера",
    plan_insight_desc:
      "На прошлой неделе вы отлично справились с процентами! На этой неделе мы уделим больше внимания логическим паттернам, чтобы укрепить ваши навыки решения задач.",
    plan_mon_track: "Понедельник • НИШ",
    plan_mon_title: "Естествознание",
    plan_mon_desc: "Повторение основ биологии и физики для вступительного экзамена в НИШ.",
    plan_tue_track: "Вторник • РФМШ",
    plan_tue_title: "Математика и логика",
    plan_tue_desc: "Решение сложных задач и логических последовательностей для специализации РФМШ.",
    plan_wed_track: "Среда • БИЛ",
    plan_wed_title: "Читательская грамотность",
    plan_wed_desc: "Критический анализ текстов и стратегии понимания для экзаменов БИЛ.",
    plan_thu_track: "Четверг • НИШ",
    plan_thu_title: "Английский и казахский языки",
    plan_thu_desc: "Практика грамматики и лексики по английскому, казахскому и русскому языкам.",
    plan_fri_track: "Пятница • НИШ",
    plan_fri_title: "Количественные",
    plan_fri_desc: "Интерпретация данных и количественное мышление для направления НИШ.",
    plan_weekend_track: "Выходные",
    plan_weekend_title: "Пробный экзамен",
    plan_weekend_desc:
      "Полноформатный тренировочный экзамен по всем разделам с ограничением по времени.",
    plan_btn_continue: "Продолжить",
    plan_btn_start: "Начать",

    // Progress Page
    prog_title: "Мой прогресс — Aibi",
    prog_meta_desc:
      "Еженедельная точность, затраченное время и статус предметов по направлениям НИШ, БИЛ и РФМШ.",
    prog_header: "Мой прогресс",
    prog_subheader: "У вас отличные результаты! Продолжайте в том же духе.",
    prog_insight_title: "Рекомендация",
    prog_insight_desc:
      "Ваши баллы по английскому и естествознанию отличные. Фокус на логике и количественных характеристиках поможет вам преуспеть в направлениях РФМШ и НИШ.",
    prog_lessons_title: "Еженедельные уроки",
    prog_lessons_completed: "Завершено",
    prog_lessons_btn: "Начать следующий урок",
    prog_nis_track: "Направление НИШ",
    prog_nspm_track: "Направление РФМШ",
    prog_bil_track: "Направление БИЛ",
    prog_improving: "Улучшается",
    prog_strong: "Сильная сторона",
    prog_needs_practice: "Нужна практика",
    prog_sub_nat_sci: "Естествознание",
    prog_sub_english: "Английский",
    prog_sub_logic: "Логика",
    prog_sub_logic_desc: "Фокус на распознавании закономерностей повысит ваш балл в этом разделе.",
    prog_accuracy_title: "Тренды точности",
    prog_time_title: "Время на обучение",
    prog_time_hrs: "ч",
    prog_time_this_week: "На этой неделе",
    prog_mon: "Пон",
    prog_tue: "Вто",
    prog_wed: "Сре",
    prog_thu: "Чет",
    prog_fri: "Пят",

    // Diagnostic Page
    diag_title: "Определите свой уровень — Aibi",
    diag_meta_desc:
      "Пройдите диагностику Aibi, чтобы определить свой уровень по предметам НИШ, БИЛ и РФМШ.",
    diag_back: "Вернуться назад",
    diag_header: "Определите свой уровень",
    diag_progress_lbl: "Прогресс диагностики",
    diag_insight_desc:
      "Искусственный интеллект проанализирует ваши ответы, чтобы найти ваши сильные и слабые темы. Не волнуйтесь, если будет сложно!",
    diag_nis_subtitle: "Назарбаев Интеллектуальные Школы",
    diag_nspm_subtitle: "Физико-математические школы",
    diag_bil_subtitle: "Билим-Инновация Лицеи",
    diag_sub_nat_sci: "Естествознание",
    diag_sub_languages: "Языки (EN, KZ, RU)",
    diag_sub_quant: "Количественные характеристики",
    diag_sub_math: "Математика",
    diag_sub_logic: "Логика",
    diag_sub_reading: "Читательская грамотность",
    diag_btn_start: "Начать диагностический тест",
    diag_time_desc: "Занимает около 15–20 минут",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Lang>("EN");

  useEffect(() => {
    const stored = localStorage.getItem("aibi_lang");
    if (stored === "EN" || stored === "KZ" || stored === "RU") {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Lang) => {
    setLanguageState(lang);
    localStorage.setItem("aibi_lang", lang);
  };

  const t = (key: string): string => {
    const dict = translations[language];
    return dict[key] || translations["EN"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
