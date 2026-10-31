(function (PL) {
  PL.meta = PL.meta || {};
  PL.meta.hydrostatic = {
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
      'یک مایع در هر لحظه: آب ۱۰۰۰، روغن سبک ۸۰۰، جیوه ۱۳۶۰۰ کیلوگرم بر متر مکعب.',
      'g = ۹٫۸ و P0 = ۱۰۱۳۲۵ پاسکال.',
      'عمق نمایشی به حداکثر ۰٫۲۲ متر نگاشته می‌شود.',
      'فشار فقط به عمق و چگالی بستگی دارد، نه به شکل ظرف.'
    ],
    status: 'ready',
    version: '1.0.0',
    order: 4,
    path: 'sims/hydrostatic/index.html',
    tags: [],
    curriculum: { grade: '', chapter: '' }
  };
})(window.PL = window.PL || {});
