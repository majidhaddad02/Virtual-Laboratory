(function (PL) {
  PL.activities = PL.activities || {};
  PL.activities['crystalline-3d'] = {
    challenges: [
      {
        id: 'cell',
        title: 'اتم در یاخته',
        question: 'در مکعب ساده، سهم اتم‌های گوشه در یک یاخته واحد چند اتم است؟',
        options: [
          '۱ (هشت گوشه × یک‌هشتم)',
          '۸ (هر گوشه یک اتم کامل)',
          '۶ (به‌اندازهٔ عدد هماهنگی)'
        ],
        answerIndex: 0,
        goal: 1,
        preset: { showCell: true, showBonds: true, autoCell: false },
        experiment: 'یاخته را روشن کن و گوشه‌های مکعب را در قاب میانی بشمار.',
        explanation: 'هشت گوشه، هر کدام بین هشت یاخته مشترک‌اند: ۸ × ۱/۸ = ۱ اتم در یاخته.'
      },
      {
        id: 'cell-shape',
        title: 'یاخته در شبکه',
        question: 'یاختهٔ روشن‌شده در بلور مکعبی ساده چه شکلی است؟',
        options: [
          'مکعب با هشت گوشه',
          'کره',
          'هرم'
        ],
        answerIndex: 0,
        goal: 0,
        preset: { showCell: true, showBonds: true, spin: true },
        experiment: 'نمایش یاخته را روشن کن و قاب میانی را با شبکهٔ سمت چپ مقایسه کن.',
        explanation: 'یاختهٔ واحد مکعب ساده هشت گوشه دارد و در شبکه تکرار می‌شود.'
      },
      {
        id: 'amorph',
        title: 'بلور و بی‌شکل',
        question: 'قاب بی‌شکل چه چیزی را نشان می‌دهد؟',
        options: [
          'همان تعداد ذره بدون شبکهٔ تکراری',
          'مایع در حال جریان',
          'یاختهٔ واحد جداشده'
        ],
        answerIndex: 0,
        goal: 2,
        preset: { showBonds: true },
        experiment: 'سه قاب را با هم مقایسه کن؛ چیدمان جدید بساز.',
        explanation: 'بی‌شکل فشرده است ولی یاختهٔ تکراری ندارد. مدل سه‌بعدی کارتونی است نه بلور واقعی.'
      }
    ],
    worksheet: {
      sections: [
        {
          title: 'یاخته واحد',
          columns: ['پرسش', 'پاسخ'],
          rows: [
            ['تعداد گوشه‌ها', ''],
            ['سهم هر گوشه', ''],
            ['اتم در یاخته', '']
          ],
          textareas: ['چرا اتم گوشه کامل به یک یاخته تعلق ندارد؟']
        }
      ]
    }
  };
})(window.PL = window.PL || {});
