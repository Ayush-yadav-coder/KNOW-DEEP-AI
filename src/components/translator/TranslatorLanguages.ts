export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
  hasRomanization?: boolean;
}

export const POPULAR_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", speechCode: "en-US" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", speechCode: "es-ES" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", speechCode: "fr-FR" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", speechCode: "de-DE" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", speechCode: "it-IT" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷", speechCode: "pt-BR" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", speechCode: "ru-RU", hasRomanization: true },
  { code: "zh", name: "Chinese (Mandarin)", nativeName: "中文 (简体)", flag: "🇨🇳", speechCode: "zh-CN", hasRomanization: true },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", speechCode: "ja-JP", hasRomanization: true },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", speechCode: "ko-KR", hasRomanization: true },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", speechCode: "hi-IN", hasRomanization: true },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", speechCode: "ar-SA", hasRomanization: true },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩", speechCode: "bn-BD", hasRomanization: true },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", speechCode: "te-IN", hasRomanization: true },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳", speechCode: "mr-IN", hasRomanization: true },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", speechCode: "ta-IN", hasRomanization: true },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰", speechCode: "ur-PK", hasRomanization: true },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳", speechCode: "gu-IN", hasRomanization: true },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳", speechCode: "kn-IN", hasRomanization: true },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳", speechCode: "ml-IN", hasRomanization: true },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳", speechCode: "pa-IN", hasRomanization: true },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳", speechCode: "vi-VN" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭", speechCode: "th-TH", hasRomanization: true },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷", speechCode: "tr-TR" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱", speechCode: "nl-NL" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱", speechCode: "pl-PL" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪", speechCode: "sv-SE" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷", speechCode: "el-GR", hasRomanization: true },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩", speechCode: "id-ID" },
  { code: "he", name: "Hebrew", nativeName: "עברית", flag: "🇮🇱", speechCode: "he-IL", hasRomanization: true },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦", speechCode: "uk-UA", hasRomanization: true },
];

export const ALL_LANGUAGES: LanguageOption[] = [
  ...POPULAR_LANGUAGES,
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans", flag: "🇿🇦", speechCode: "af-ZA" },
  { code: "sq", name: "Albanian", nativeName: "Shqip", flag: "🇦🇱", speechCode: "sq-AL" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ", flag: "🇪🇹", speechCode: "am-ET", hasRomanization: true },
  { code: "hy", name: "Armenian", nativeName: "Հայերեն", flag: "🇦🇲", speechCode: "hy-AM", hasRomanization: true },
  { code: "az", name: "Azerbaijani", nativeName: "Azərbaycan", flag: "🇦🇿", speechCode: "az-AZ" },
  { code: "eu", name: "Basque", nativeName: "Euskara", flag: "🇪🇸", speechCode: "eu-ES" },
  { code: "be", name: "Belarusian", nativeName: "Беларуская", flag: "🇧🇾", speechCode: "be-BY", hasRomanization: true },
  { code: "bs", name: "Bosnian", nativeName: "Bosanski", flag: "🇧🇦", speechCode: "bs-BA" },
  { code: "bg", name: "Bulgarian", nativeName: "Български", flag: "🇧🇬", speechCode: "bg-BG", hasRomanization: true },
  { code: "my", name: "Burmese", nativeName: "မြန်မာ", flag: "🇲🇲", speechCode: "my-MM", hasRomanization: true },
  { code: "ca", name: "Catalan", nativeName: "Català", flag: "🇪🇸", speechCode: "ca-ES" },
  { code: "ceb", name: "Cebuano", nativeName: "Bisaya", flag: "🇵🇭", speechCode: "ceb-PH" },
  { code: "ny", name: "Chichewa", nativeName: "ChiCheŵa", flag: "🇲🇼", speechCode: "ny-MW" },
  { code: "co", name: "Corsican", nativeName: "Corsu", flag: "🇫🇷", speechCode: "co-FR" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski", flag: "🇭🇷", speechCode: "hr-HR" },
  { code: "cs", name: "Czech", nativeName: "Čeština", flag: "🇨🇿", speechCode: "cs-CZ" },
  { code: "da", name: "Danish", nativeName: "Dansk", flag: "🇩🇰", speechCode: "da-DK" },
  { code: "eo", name: "Esperanto", nativeName: "Esperanto", flag: "🌐", speechCode: "eo" },
  { code: "et", name: "Estonian", nativeName: "Eesti", flag: "🇪🇪", speechCode: "et-EE" },
  { code: "tl", name: "Filipino (Tagalog)", nativeName: "Wikang Filipino", flag: "🇵🇭", speechCode: "tl-PH" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", flag: "🇫🇮", speechCode: "fi-FI" },
  { code: "fy", name: "Frisian", nativeName: "Frysk", flag: "🇳🇱", speechCode: "fy-NL" },
  { code: "gl", name: "Galician", nativeName: "Galego", flag: "🇪🇸", speechCode: "gl-ES" },
  { code: "ka", name: "Georgian", nativeName: "ქართული", flag: "🇬🇪", speechCode: "ka-GE", hasRomanization: true },
  { code: "ht", name: "Haitian Creole", nativeName: "Kreyòl Ayisyen", flag: "🇭🇹", speechCode: "ht-HT" },
  { code: "ha", name: "Hausa", nativeName: "Hausa", flag: "🇳🇬", speechCode: "ha-NG" },
  { code: "haw", name: "Hawaiian", nativeName: "ʻŌlelo Hawaiʻi", flag: "🇺🇸", speechCode: "haw-US" },
  { code: "hmn", name: "Hmong", nativeName: "Hmoob", flag: "🌐", speechCode: "hmn" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", flag: "🇭🇺", speechCode: "hu-HU" },
  { code: "is", name: "Icelandic", nativeName: "Íslenska", flag: "🇮🇸", speechCode: "is-IS" },
  { code: "ig", name: "Igbo", nativeName: "Asụsụ Igbo", flag: "🇳🇬", speechCode: "ig-NG" },
  { code: "ga", name: "Irish", nativeName: "Gaeilge", flag: "🇮🇪", speechCode: "ga-IE" },
  { code: "jw", name: "Javanese", nativeName: "Basa Jawa", flag: "🇮🇩", speechCode: "jw-ID" },
  { code: "kk", name: "Kazakh", nativeName: "Қазақ тілі", flag: "🇰🇿", speechCode: "kk-KZ", hasRomanization: true },
  { code: "km", name: "Khmer", nativeName: "ភាសាខ្មែរ", flag: "🇰🇭", speechCode: "km-KH", hasRomanization: true },
  { code: "rw", name: "Kinyarwanda", nativeName: "Ikinyarwanda", flag: "🇷🇼", speechCode: "rw-RW" },
  { code: "ku", name: "Kurdish", nativeName: "Kurdî", flag: "🇮🇶", speechCode: "ku-TR" },
  { code: "ky", name: "Kyrgyz", nativeName: "Кыргызча", flag: "🇰🇬", speechCode: "ky-KG", hasRomanization: true },
  { code: "lo", name: "Lao", nativeName: "ພາສາລາວ", flag: "🇱🇦", speechCode: "lo-LA", hasRomanization: true },
  { code: "la", name: "Latin", nativeName: "Latina", flag: "🇻🇦", speechCode: "la" },
  { code: "lv", name: "Latvian", nativeName: "Latviešu", flag: "🇱🇻", speechCode: "lv-LV" },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuvių", flag: "🇱🇹", speechCode: "lt-LT" },
  { code: "lb", name: "Luxembourgish", nativeName: "Lëtzebuergesch", flag: "🇱🇺", speechCode: "lb-LU" },
  { code: "mk", name: "Macedonian", nativeName: "Македонски", flag: "🇲🇰", speechCode: "mk-MK", hasRomanization: true },
  { code: "mg", name: "Malagasy", nativeName: "Malagasy", flag: "🇲🇬", speechCode: "mg-MG" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾", speechCode: "ms-MY" },
  { code: "mt", name: "Maltese", nativeName: "Malti", flag: "🇲🇹", speechCode: "mt-MT" },
  { code: "mi", name: "Maori", nativeName: "Te Reo Māori", flag: "🇳🇿", speechCode: "mi-NZ" },
  { code: "mn", name: "Mongolian", nativeName: "Монгол хэл", flag: "🇲🇳", speechCode: "mn-MN", hasRomanization: true },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", flag: "🇳🇵", speechCode: "ne-NP", hasRomanization: true },
  { code: "no", name: "Norwegian", nativeName: "Norsk", flag: "🇳🇴", speechCode: "no-NO" },
  { code: "ps", name: "Pashto", nativeName: "پښتو", flag: "🇦🇫", speechCode: "ps-AF", hasRomanization: true },
  { code: "fa", name: "Persian (Farsi)", nativeName: "فارسی", flag: "🇮🇷", speechCode: "fa-IR", hasRomanization: true },
  { code: "ro", name: "Romanian", nativeName: "Română", flag: "🇷🇴", speechCode: "ro-RO" },
  { code: "sm", name: "Samoan", nativeName: "Gagana Sāmoa", flag: "🇼🇸", speechCode: "sm-WS" },
  { code: "gd", name: "Scots Gaelic", nativeName: "Gàidhlig", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", speechCode: "gd-GB" },
  { code: "sr", name: "Serbian", nativeName: "Српски", flag: "🇷🇸", speechCode: "sr-RS", hasRomanization: true },
  { code: "st", name: "Sesotho", nativeName: "Sesotho", flag: "🇱🇸", speechCode: "st-LS" },
  { code: "sn", name: "Shona", nativeName: "ChiShona", flag: "🇿🇼", speechCode: "sn-ZW" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي", flag: "🇵🇰", speechCode: "sd-PK", hasRomanization: true },
  { code: "si", name: "Sinhala", nativeName: "සිංහල", flag: "🇱🇰", speechCode: "si-LK", hasRomanization: true },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina", flag: "🇸🇰", speechCode: "sk-SK" },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina", flag: "🇸🇮", speechCode: "sl-SI" },
  { code: "so", name: "Somali", nativeName: "Soomaaliga", flag: "🇸🇴", speechCode: "so-SO" },
  { code: "su", name: "Sundanese", nativeName: "Basa Sunda", flag: "🇮🇩", speechCode: "su-ID" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", flag: "🇰🇪", speechCode: "sw-KE" },
  { code: "tg", name: "Tajik", nativeName: "Тоҷикӣ", flag: "🇹🇯", speechCode: "tg-TJ", hasRomanization: true },
  { code: "tt", name: "Tatar", nativeName: "Татар теле", flag: "🇷🇺", speechCode: "tt-RU", hasRomanization: true },
  { code: "uz", name: "Uzbek", nativeName: "Oʻzbekcha", flag: "🇺🇿", speechCode: "uz-UZ" },
  { code: "cy", name: "Welsh", nativeName: "Cymraeg", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", speechCode: "cy-GB" },
  { code: "xh", name: "Xhosa", nativeName: "isiXhosa", flag: "🇿🇦", speechCode: "xh-ZA" },
  { code: "yi", name: "Yiddish", nativeName: "ייִדיש", flag: "🇮🇱", speechCode: "yi" },
  { code: "yo", name: "Yoruba", nativeName: "Èdè Yorùbá", flag: "🇳🇬", speechCode: "yo-NG" },
  { code: "zu", name: "Zulu", nativeName: "isiZulu", flag: "🇿🇦", speechCode: "zu-ZA" },
];

export function getLanguageName(code: string): string {
  if (code === "auto") return "Detect Language";
  const found = ALL_LANGUAGES.find((l) => l.code.toLowerCase() === code.toLowerCase());
  return found ? found.name : code;
}

export function getLanguageFlag(code: string): string {
  if (code === "auto") return "✨";
  const found = ALL_LANGUAGES.find((l) => l.code.toLowerCase() === code.toLowerCase());
  return found ? found.flag : "🌐";
}

export function getSpeechCode(code: string): string {
  const found = ALL_LANGUAGES.find((l) => l.code.toLowerCase() === code.toLowerCase());
  return found ? found.speechCode : "en-US";
}
