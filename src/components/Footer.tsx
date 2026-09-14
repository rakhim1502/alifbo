export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div id="about">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Loyiha haqida
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              O'zbek alifbo konvertori — eski lotin yozuvidagi matnlarni yangi lotin alifbosiga 
              avtomatik konvertatsiya qilish uchun bepul vosita.
            </p>
          </div>

          {/* Rules */}
          <div id="rules">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Asosiy qoidalar
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>sh → ş</li>
              <li>ch → ç</li>
              <li>o' → ö</li>
              <li>g' → ğ</li>
              <li>ng → ñ</li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Qo'llab-quvvatlash
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>TXT fayl yuklash</li>
              <li>Natijani nusxalash</li>
              <li>TXT formatida yuklab olish</li>
              <li>Dark/Light rejim</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2026 O'zbek Alifbo Konvertori. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </footer>
  );
}
