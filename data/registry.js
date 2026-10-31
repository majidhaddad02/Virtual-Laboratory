(function (PL) {
  PL.topics = [
    { id: 'molecular', title: 'نیروی مولکولی' },
    { id: 'pressure', title: 'فشار' }
  ];

  PL.registry = [
    {
      id: 'crystalline',
      title: 'جامد بلورین و بی‌شکل',
      topics: ['molecular'],
      level: 'grade10',
      goals: [
        'نظم بلندبرد ذرات در جامد بلورین را با چینش بی‌نظم جامد بی‌شکل مقایسه کنید.',
        'با تغییر دما دامنه ارتعاش ذرات را مشاهده کنید.',
        'نقش پیوندها را در نمایش شبکه روشن و خاموش کنید.'
      ],
      modelNotes: [
        'ذرات دوبعدی کارتونی هستند، نه اتم واقعی.',
        'دما مقیاس نسبی ۰ تا ۱۰۰ است، نه کلوین.',
        'هر ذره در چاه هماهنگ حول جایگاه خود می‌لرزد.',
        'فاصله‌ها در مربع واحد هستند؛ g در این مدل نیست.'
      ],
      status: 'ready',
      version: '1.0.0',
      order: 1,
      thumbnail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#cfe9f8"/><rect y="120" width="320" height="80" fill="#d9ec9a"/><g stroke="#1565c0" stroke-width="1.6" fill="none" opacity=".45"><line x1="70" y1="70" x2="94" y2="70"/><line x1="94" y1="70" x2="118" y2="70"/><line x1="82" y1="90" x2="106" y2="90"/><line x1="70" y1="70" x2="82" y2="90"/><line x1="94" y1="70" x2="82" y2="90"/><line x1="94" y1="70" x2="106" y2="90"/></g><g fill="#1565c0"><circle cx="70" cy="70" r="9"/><circle cx="94" cy="70" r="9"/><circle cx="118" cy="70" r="9"/><circle cx="82" cy="90" r="9"/><circle cx="106" cy="90" r="9"/><circle cx="130" cy="90" r="9"/><circle cx="70" cy="110" r="9"/><circle cx="94" cy="110" r="9"/><circle cx="118" cy="110" r="9"/></g><g fill="#e07a1f"><circle cx="210" cy="68" r="9"/><circle cx="236" cy="62" r="9"/><circle cx="258" cy="78" r="9"/><circle cx="204" cy="92" r="9"/><circle cx="228" cy="98" r="9"/><circle cx="252" cy="104" r="9"/><circle cx="218" cy="118" r="9"/><circle cx="246" cy="122" r="9"/></g></svg>',
      path: 'sims/crystalline/index.html'
    },
    {
      id: 'crystalline-3d',
      title: 'بلور سه‌بعدی و یاخته واحد',
      topics: ['molecular'],
      level: 'grade10',
      goals: [
        'یاخته واحد مکعبی ساده را در شبکه سه‌بعدی ببینید.',
        'سهم گوشه‌ها در شمارش اتم در یاخته را دنبال کنید.',
        'شبکه بلوری را با آرایش بی‌نظم مقایسه کنید.'
      ],
      modelNotes: [
        'ذرات کارتونی سه‌بعدی هستند، نه اتم واقعی.',
        'دما مقیاس نسبی ۰ تا ۱۰۰ است، نه کلوین.',
        'شبکه مکعبی ساده ۴×۴×۴؛ یاخته واحد ۸ گوشه.',
        'چرخش دوربین نمایشی است و بر فیزیک اثر ندارد.'
      ],
      status: 'ready',
      version: '1.0.0',
      order: 2,
      thumbnail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#1c2a3a"/><g fill="#64b0ff" opacity=".95"><circle cx="90" cy="70" r="8"/><circle cx="118" cy="62" r="8"/><circle cx="146" cy="70" r="8"/><circle cx="82" cy="96" r="8"/><circle cx="110" cy="88" r="8"/><circle cx="138" cy="96" r="8"/><circle cx="98" cy="118" r="8"/><circle cx="126" cy="110" r="8"/><circle cx="154" cy="118" r="8"/></g><g fill="#ff6fa8"><circle cx="110" cy="88" r="10"/><circle cx="138" cy="96" r="10"/><circle cx="126" cy="110" r="10"/><circle cx="154" cy="118" r="10"/></g><g fill="#ffb347"><circle cx="220" cy="72" r="8"/><circle cx="248" cy="64" r="8"/><circle cx="268" cy="86" r="8"/><circle cx="208" cy="98" r="8"/><circle cx="236" cy="108" r="8"/><circle cx="260" cy="118" r="8"/><circle cx="224" cy="128" r="8"/></g></svg>',
      path: 'sims/crystalline-3d/index.html'
    },
    {
      id: 'surface-tension',
      title: 'کشش سطحی و موئینگی',
      topics: ['molecular'],
      level: 'grade10',
      goals: [
        'شناوری سوزن روی سطح آب را با نیروی کشش سطح ببینید.',
        'بالا رفتن آب و پایین رفتن جیوه در لوله موئین را مقایسه کنید.',
        'اثر شعاع لوله بر ارتفاع موئینگی را مشاهده کنید.'
      ],
      modelNotes: [
        'γ آب ۰٫۰۷۲ و جیوه ۰٫۴۸۵ نیوتن بر متر؛ ρ آب ۱۰۰۰ و جیوه ۱۳۶۰۰.',
        'ارتفاع موئینگی h = 2γ cosθ / (ρ g r) است؛ r بر حسب میلی‌متر.',
        'صابون γ را به ۰٫۴ برابر می‌رساند؛ سوزن با F = 2γL در برابر وزن.',
        'g = ۹٫۸؛ زاویه تماس از دگرچسبی با θ = arccos(2s − 1).'
      ],
      status: 'ready',
      version: '1.0.0',
      order: 3,
      thumbnail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#b8e0f5"/><path d="M0 90 Q80 70 160 90 T320 90 V200 H0 Z" fill="#4a90e2"/><ellipse cx="80" cy="58" rx="28" ry="26" fill="#7fb8ee" stroke="#2b6cb0" stroke-width="2"/><ellipse cx="160" cy="78" rx="42" ry="16" fill="#7fb8ee" stroke="#2b6cb0" stroke-width="2"/><ellipse cx="250" cy="86" rx="54" ry="8" fill="#7fb8ee" stroke="#2b6cb0" stroke-width="2"/><rect x="148" y="48" width="24" height="10" rx="5" fill="#6c757d"/></svg>',
      path: 'sims/surface-tension/index.html'
    },
    {
      id: 'hydrostatic',
      title: 'نقاط هم‌تراز',
      topics: ['pressure'],
      level: 'grade10',
      goals: [
        'فشار را در عمق یکسان سه ظرف مرتبط برابر ببینید.',
        'رابطه P = P0 + ρgh را با فشارسنج دنبال کنید.',
        'شکل ظرف را از مقدار فشار در یک تراز جدا کنید.'
      ],
      modelNotes: [
        'یک مایع در هر لحظه: آب ۱۰۰۰، روغن ۸۰۰، جیوه ۱۳۶۰۰ کیلوگرم بر متر مکعب.',
        'g = ۹٫۸ و P0 = ۱۰۱۳۲۵ پاسکال.',
        'عمق نمایشی به حداکثر ۰٫۲۲ متر نگاشته می‌شود.',
        'فشار فقط به عمق و چگالی بستگی دارد، نه به شکل ظرف.'
      ],
      status: 'ready',
      version: '1.0.0',
      order: 4,
      thumbnail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#f4efe3"/><path d="M28 168 H292 V140 H28 Z" fill="#5dade2"/><path d="M52 140 L52 72 L72 50 L92 72 L92 140 Z" fill="#5dade2"/><rect x="138" y="50" width="44" height="90" fill="#5dade2"/><path d="M220 140 L232 82 L244 50 L256 82 L268 140 Z" fill="#5dade2"/><path d="M50 46 H94 V140" fill="none" stroke="#6b7785" stroke-width="3"/><rect x="136" y="46" width="48" height="94" fill="none" stroke="#6b7785" stroke-width="3"/><path d="M218 46 H270 V140" fill="none" stroke="#6b7785" stroke-width="3"/><rect x="26" y="138" width="268" height="32" fill="none" stroke="#6b7785" stroke-width="3"/><line x1="36" y1="108" x2="284" y2="108" stroke="#9b59b6" stroke-width="2" stroke-dasharray="5 4"/><circle cx="72" cy="108" r="5" fill="#c0392b"/><circle cx="160" cy="108" r="5" fill="#c0392b"/><circle cx="244" cy="108" r="5" fill="#c0392b"/></svg>',
      path: 'sims/hydrostatic/index.html'
    },
    {
      id: 'u-tube',
      title: 'لوله U شکل',
      topics: ['pressure'],
      level: 'grade10',
      goals: [
        'جفت نقاط هم‌فشار معتبر را در مایع پیوسته انتخاب کنید.',
        'فشار را از ضخامت قائم لایه‌ها بنویسید، نه از طول قوس خم.',
        'ارتفاع مجهول را از معادله پیش‌بینی کنید.'
      ],
      modelNotes: [
        'بازوها بازند؛ هر سطح آزاد فشار جو است.',
        'خم فقط گرافیکی است؛ فشار از ضخامت قائم لایه است نه طول قوس.',
        'مایع‌های ایمن: آب ۱۰۰۰، روغن ۹۲۰، گلیسیرین ۱۲۶۰ کیلوگرم بر متر مکعب.',
        'g برابر ۹٫۸ یا ۱۰؛ مقایسه فقط در مایع پیوستهٔ متصل معتبر است.'
      ],
      status: 'ready',
      version: '1.0.0',
      order: 5,
      thumbnail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#d7eef9"/><rect y="168" width="320" height="32" fill="#8b5a2b"/><path d="M108 36 V118 A52 52 0 0 0 212 118 V36" fill="none" stroke="#6b7785" stroke-width="22" stroke-linecap="butt"/><path d="M108 36 V118 A52 52 0 0 0 212 118 V36" fill="none" stroke="#fff" stroke-width="16" opacity=".35"/><path d="M108 92 V118 A52 52 0 0 0 212 118 V58" fill="none" stroke="#3d9be8" stroke-width="16"/><line x1="108" y1="86" x2="108" y2="40" stroke="#2b8a3e" stroke-width="2"/><polygon points="108,40 103,50 113,50" fill="#2b8a3e"/><line x1="212" y1="52" x2="212" y2="28" stroke="#2b8a3e" stroke-width="2"/><polygon points="212,28 207,38 217,38" fill="#2b8a3e"/><line x1="118" y1="92" x2="222" y2="58" stroke="#c0392b" stroke-width="2"/></svg>',
      path: 'sims/u-tube/index.html'
    }
  ];
})(window.PL = window.PL || {});
