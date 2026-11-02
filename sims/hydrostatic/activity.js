(function (PL) {
  PL.activities = PL.activities || {};
  PL.activities.hydrostatic = {
    challenges: [
      {
        id: 'depth',
        title: 'فشار و عمق',
        question: 'اگر عمق را دو برابر کنی، فشار پیمانه‌ای (P − P0) چه می‌شود؟',
        options: [
          'دو برابر می‌شود',
          'نصف می‌شود',
          'عوض نمی‌شود چون جو ثابت است'
        ],
        answerIndex: 0,
        goal: 0,
        preset: { depth: 21, rho: 1000, showP: true, showH: true, showEq: true },
        experiment: 'خط بنفش را جابه‌جا کن و فشارسنج‌ها را با عمق کم و زیاد بخوان.',
        explanation: 'P = P0 + ρgh پس فشار پیمانه‌ای با عمق خطی است. دو برابر عمق، دو برابر ρgh.'
      },
      {
        id: 'density',
        title: 'چگالی',
        question: 'در عمق یکسان، فشار آب با روغن سبک چه رابطه‌ای دارد؟',
        options: [
          'فشار آب بیشتر است چون چگالی آب بیشتر است',
          'فشار روغن بیشتر است',
          'هر دو برابرند چون عمق یکی است'
        ],
        answerIndex: 0,
        goal: 1,
        preset: { depth: 42, rho: 800, showP: true },
        experiment: 'در یک عمق، آب و روغن سبک را عوض کن و عقربه‌ها را ببین.',
        explanation: 'ρ آب ۱۰۰۰ و ρ روغن سبک ۸۰۰ است. در h یکسان، ρgh آب بزرگ‌تر است.'
      },
      {
        id: 'shape',
        title: 'شکل ظرف',
        question: 'روی خط بنفش، فشار در ظرف پهن A و استوانه B و قیف C چگونه است؟',
        options: [
          'هر سه برابرند',
          'در قیف کمتر است',
          'در ظرف پهن بیشتر است'
        ],
        answerIndex: 0,
        goal: 2,
        preset: { depth: 42, rho: 1000, showP: true, showEq: true },
        experiment: 'خط را ثابت بگذار و هر سه فشارسنج را با هم ببین.',
        explanation: 'در مایع ساکن و مرتبط، فشار فقط به عمق و چگالی بستگی دارد نه به شکل ظرف.'
      }
    ],
    worksheet: {
      sections: [
        {
          title: 'P = P0 + ρgh',
          columns: ['مایع', 'عمق', 'فشار نسبی'],
          rows: [
            ['آب', 'کم', ''],
            ['آب', 'زیاد', ''],
            ['روغن سبک', 'همان عمق زیاد', '']
          ],
          textareas: ['چرا شکل ظرف روی خط بنفش فشار را عوض نمی‌کند؟']
        }
      ]
    }
  };
})(window.PL = window.PL || {});
