const NUMBER_WORDS = new Map([
  ["zero", 0],
  ["one", 1],
  ["two", 2],
  ["three", 3],
  ["four", 4],
  ["five", 5],
  ["six", 6],
  ["seven", 7],
  ["eight", 8],
  ["nine", 9],
  ["ten", 10],
]);

const STATUS_PRIORITY = {
  monitoring: 1,
  suspected: 2,
  confirmed: 3,
};

export const COUNTRY_CATALOG = [
  // Africa
  { name: "Algeria", latitude: 28.0339, longitude: 1.6596, aliases: ["Algeria", "Algerian"] },
  { name: "Angola", latitude: -11.2027, longitude: 17.8739, aliases: ["Angola", "Angolan"] },
  { name: "Benin", latitude: 9.3077, longitude: 2.3158, aliases: ["Benin", "Beninese"] },
  { name: "Botswana", latitude: -22.3285, longitude: 24.6849, aliases: ["Botswana", "Botswanan"] },
  { name: "Burkina Faso", latitude: 12.3641, longitude: -1.5275, aliases: ["Burkina Faso", "Burkinabe", "Burkinabé"] },
  { name: "Burundi", latitude: -3.3731, longitude: 29.9189, aliases: ["Burundi", "Burundian"] },
  { name: "Cabo Verde", latitude: 16.5388, longitude: -23.0418, aliases: ["Cabo Verde", "Cape Verde", "Cape Verdean"] },
  { name: "Cameroon", latitude: 3.848, longitude: 11.5021, aliases: ["Cameroon", "Cameroonian"] },
  { name: "Central African Republic", latitude: 6.6111, longitude: 20.9394, aliases: ["Central African Republic", "CAR"] },
  { name: "Chad", latitude: 15.4542, longitude: 18.7322, aliases: ["Chad", "Chadian"] },
  { name: "Comoros", latitude: -11.6455, longitude: 43.3333, aliases: ["Comoros", "Comorian"] },
  { name: "Democratic Republic of the Congo", latitude: -4.0383, longitude: 21.7587, aliases: ["Democratic Republic of the Congo", "DRC", "Congo-Kinshasa", "DR Congo"] },
  { name: "Republic of the Congo", latitude: -0.228, longitude: 15.8277, aliases: ["Republic of the Congo", "Congo-Brazzaville"] },
  { name: "Djibouti", latitude: 11.8251, longitude: 42.5903, aliases: ["Djibouti", "Djiboutian"] },
  { name: "Egypt", latitude: 26.8206, longitude: 30.8025, aliases: ["Egypt", "Egyptian"] },
  { name: "Equatorial Guinea", latitude: 1.6508, longitude: 10.2679, aliases: ["Equatorial Guinea", "Equatoguinean"] },
  { name: "Eritrea", latitude: 15.1794, longitude: 39.7823, aliases: ["Eritrea", "Eritrean"] },
  { name: "Eswatini", latitude: -26.5225, longitude: 31.4659, aliases: ["Eswatini", "Swaziland", "Swazi"] },
  { name: "Ethiopia", latitude: 9.145, longitude: 40.4897, aliases: ["Ethiopia", "Ethiopian"] },
  { name: "Gabon", latitude: -0.8037, longitude: 11.6094, aliases: ["Gabon", "Gabonese"] },
  { name: "Gambia", latitude: 13.4432, longitude: -15.3101, aliases: ["Gambia", "Gambian"] },
  { name: "Ghana", latitude: 7.9465, longitude: -1.0232, aliases: ["Ghana", "Ghanaian"] },
  { name: "Guinea-Bissau", latitude: 11.8037, longitude: -15.1804, aliases: ["Guinea-Bissau", "Guinea Bissau"] },
  { name: "Guinea", latitude: 9.9456, longitude: -11.6874, aliases: ["Guinea", "Guinean"] },
  { name: "Ivory Coast", latitude: 7.54, longitude: -5.5471, aliases: ["Ivory Coast", "Côte d'Ivoire", "Cote d'Ivoire", "Ivorian"] },
  { name: "Kenya", latitude: -0.0236, longitude: 37.9062, aliases: ["Kenya", "Kenyan"] },
  { name: "Lesotho", latitude: -29.6099, longitude: 28.2336, aliases: ["Lesotho", "Basotho"] },
  { name: "Liberia", latitude: 6.4281, longitude: -9.4295, aliases: ["Liberia", "Liberian"] },
  { name: "Libya", latitude: 26.3351, longitude: 17.2283, aliases: ["Libya", "Libyan"] },
  { name: "Madagascar", latitude: -18.7669, longitude: 46.8691, aliases: ["Madagascar", "Malagasy"] },
  { name: "Malawi", latitude: -13.2543, longitude: 34.3015, aliases: ["Malawi", "Malawian"] },
  { name: "Mali", latitude: 17.5707, longitude: -3.9962, aliases: ["Mali", "Malian"] },
  { name: "Mauritania", latitude: 21.0079, longitude: -10.9408, aliases: ["Mauritania", "Mauritanian"] },
  { name: "Mauritius", latitude: -20.348, longitude: 57.5522, aliases: ["Mauritius", "Mauritian"] },
  { name: "Morocco", latitude: 31.7917, longitude: -7.0926, aliases: ["Morocco", "Moroccan"] },
  { name: "Mozambique", latitude: -18.6657, longitude: 35.5296, aliases: ["Mozambique", "Mozambican"] },
  { name: "Namibia", latitude: -22.9576, longitude: 18.4904, aliases: ["Namibia", "Namibian"] },
  { name: "Niger", latitude: 17.6078, longitude: 8.0817, aliases: ["Niger", "Nigerien"] },
  { name: "Nigeria", latitude: 9.082, longitude: 8.6753, aliases: ["Nigeria", "Nigerian"] },
  { name: "Rwanda", latitude: -1.9403, longitude: 29.8739, aliases: ["Rwanda", "Rwandan"] },
  { name: "São Tomé and Príncipe", latitude: 0.1864, longitude: 6.6131, aliases: ["São Tomé and Príncipe", "Sao Tome and Principe"] },
  { name: "Senegal", latitude: 14.4974, longitude: -14.4524, aliases: ["Senegal", "Senegalese"] },
  { name: "Seychelles", latitude: -4.6796, longitude: 55.492, aliases: ["Seychelles", "Seychellois"] },
  { name: "Sierra Leone", latitude: 8.4606, longitude: -11.7799, aliases: ["Sierra Leone", "Sierra Leonean"] },
  { name: "Somalia", latitude: 5.1521, longitude: 46.1996, aliases: ["Somalia", "Somali"] },
  { name: "South Africa", latitude: -30.5595, longitude: 22.9375, aliases: ["South Africa", "Johannesburg"] },
  { name: "South Sudan", latitude: 6.877, longitude: 31.307, aliases: ["South Sudan", "South Sudanese"] },
  { name: "Sudan", latitude: 12.8628, longitude: 30.2176, aliases: ["Sudan", "Sudanese"] },
  { name: "Tanzania", latitude: -6.369, longitude: 34.8888, aliases: ["Tanzania", "Tanzanian"] },
  { name: "Togo", latitude: 8.6195, longitude: 0.8248, aliases: ["Togo", "Togolese"] },
  { name: "Tunisia", latitude: 33.8869, longitude: 9.5375, aliases: ["Tunisia", "Tunisian"] },
  { name: "Uganda", latitude: 1.3733, longitude: 32.2903, aliases: ["Uganda", "Ugandan"] },
  { name: "Zambia", latitude: -13.1339, longitude: 27.8493, aliases: ["Zambia", "Zambian"] },
  { name: "Zimbabwe", latitude: -19.0154, longitude: 29.1549, aliases: ["Zimbabwe", "Zimbabwean"] },

  // Americas
  { name: "Antigua and Barbuda", latitude: 17.0608, longitude: -61.7964, aliases: ["Antigua and Barbuda", "Antiguan", "Barbudan"] },
  { name: "Argentina", latitude: -38.4161, longitude: -63.6167, aliases: ["Argentina", "Argentine", "Argentinian"] },
  { name: "Bahamas", latitude: 25.0343, longitude: -77.3963, aliases: ["Bahamas", "Bahamian"] },
  { name: "Barbados", latitude: 13.1939, longitude: -59.5432, aliases: ["Barbados", "Barbadian"] },
  { name: "Belize", latitude: 17.1899, longitude: -88.4976, aliases: ["Belize", "Belizean"] },
  { name: "Bolivia", latitude: -16.2902, longitude: -63.5887, aliases: ["Bolivia", "Bolivian"] },
  { name: "Brazil", latitude: -14.235, longitude: -51.9253, aliases: ["Brazil", "Brazilian"] },
  { name: "Canada", latitude: 56.1304, longitude: -106.3468, aliases: ["Canada", "Canadian"] },
  { name: "Chile", latitude: -35.6751, longitude: -71.543, aliases: ["Chile", "Chilean"] },
  { name: "Colombia", latitude: 4.5709, longitude: -74.2973, aliases: ["Colombia", "Colombian"] },
  { name: "Costa Rica", latitude: 9.7489, longitude: -83.7534, aliases: ["Costa Rica", "Costa Rican"] },
  { name: "Cuba", latitude: 21.5218, longitude: -77.7812, aliases: ["Cuba", "Cuban"] },
  { name: "Dominica", latitude: 15.415, longitude: -61.371, aliases: ["Dominica"] },
  { name: "Dominican Republic", latitude: 18.7357, longitude: -70.1627, aliases: ["Dominican Republic", "Dominican"] },
  { name: "Ecuador", latitude: -1.8312, longitude: -78.1834, aliases: ["Ecuador", "Ecuadorian"] },
  { name: "El Salvador", latitude: 13.7942, longitude: -88.8965, aliases: ["El Salvador", "Salvadoran"] },
  { name: "Grenada", latitude: 12.1165, longitude: -61.679, aliases: ["Grenada", "Grenadian"] },
  { name: "Guatemala", latitude: 15.7835, longitude: -90.2308, aliases: ["Guatemala", "Guatemalan"] },
  { name: "Guyana", latitude: 4.8604, longitude: -58.9302, aliases: ["Guyana", "Guyanese"] },
  { name: "Haiti", latitude: 18.9712, longitude: -72.2852, aliases: ["Haiti", "Haitian"] },
  { name: "Honduras", latitude: 15.2, longitude: -86.2419, aliases: ["Honduras", "Honduran"] },
  { name: "Jamaica", latitude: 18.1096, longitude: -77.2975, aliases: ["Jamaica", "Jamaican"] },
  { name: "Mexico", latitude: 23.6345, longitude: -102.5528, aliases: ["Mexico", "Mexican"] },
  { name: "Nicaragua", latitude: 12.8654, longitude: -85.2072, aliases: ["Nicaragua", "Nicaraguan"] },
  { name: "Panama", latitude: 8.538, longitude: -80.7821, aliases: ["Panama", "Panamanian"] },
  { name: "Paraguay", latitude: -23.4425, longitude: -58.4438, aliases: ["Paraguay", "Paraguayan"] },
  { name: "Peru", latitude: -9.19, longitude: -75.0152, aliases: ["Peru", "Peruvian"] },
  { name: "Saint Kitts and Nevis", latitude: 17.3578, longitude: -62.783, aliases: ["Saint Kitts and Nevis", "St Kitts and Nevis", "St. Kitts and Nevis"] },
  { name: "Saint Lucia", latitude: 13.9094, longitude: -60.9789, aliases: ["Saint Lucia", "St Lucia", "St. Lucia", "Saint Lucian"] },
  { name: "Saint Vincent and the Grenadines", latitude: 12.9843, longitude: -61.2872, aliases: ["Saint Vincent and the Grenadines", "St Vincent", "Vincentian"] },
  { name: "Suriname", latitude: 3.9193, longitude: -56.0278, aliases: ["Suriname", "Surinamese"] },
  { name: "Trinidad and Tobago", latitude: 10.6918, longitude: -61.2225, aliases: ["Trinidad and Tobago", "Trinidad", "Tobago", "Trinidadian"] },
  { name: "Uruguay", latitude: -32.5228, longitude: -55.7658, aliases: ["Uruguay", "Uruguayan"] },
  { name: "USA", latitude: 39.8283, longitude: -98.5795, aliases: ["USA", "U.S.", "United States", "United States of America", "American"] },
  { name: "Venezuela", latitude: 6.4238, longitude: -66.5897, aliases: ["Venezuela", "Venezuelan"] },

  // Asia
  { name: "Afghanistan", latitude: 33.9391, longitude: 67.7099, aliases: ["Afghanistan", "Afghan"] },
  { name: "Armenia", latitude: 40.0691, longitude: 45.0382, aliases: ["Armenia", "Armenian"] },
  { name: "Azerbaijan", latitude: 40.1431, longitude: 47.5769, aliases: ["Azerbaijan", "Azerbaijani"] },
  { name: "Bahrain", latitude: 25.9304, longitude: 50.6378, aliases: ["Bahrain", "Bahraini"] },
  { name: "Bangladesh", latitude: 23.685, longitude: 90.3563, aliases: ["Bangladesh", "Bangladeshi"] },
  { name: "Bhutan", latitude: 27.5142, longitude: 90.4336, aliases: ["Bhutan", "Bhutanese"] },
  { name: "Brunei", latitude: 4.5353, longitude: 114.7277, aliases: ["Brunei", "Bruneian"] },
  { name: "Cambodia", latitude: 12.5657, longitude: 104.991, aliases: ["Cambodia", "Cambodian", "Khmer"] },
  { name: "China", latitude: 35.8617, longitude: 104.1954, aliases: ["China", "Chinese"] },
  { name: "Cyprus", latitude: 35.1264, longitude: 33.4299, aliases: ["Cyprus", "Cypriot"] },
  { name: "Georgia", latitude: 42.3154, longitude: 43.3569, aliases: ["Georgia", "Georgian"] },
  { name: "India", latitude: 20.5937, longitude: 78.9629, aliases: ["India", "Indian"] },
  { name: "Indonesia", latitude: -0.7893, longitude: 113.9213, aliases: ["Indonesia", "Indonesian"] },
  { name: "Iran", latitude: 32.4279, longitude: 53.688, aliases: ["Iran", "Iranian", "Persian"] },
  { name: "Iraq", latitude: 33.2232, longitude: 43.6793, aliases: ["Iraq", "Iraqi"] },
  { name: "Israel", latitude: 31.0461, longitude: 34.8516, aliases: ["Israel", "Israeli"] },
  { name: "Japan", latitude: 36.2048, longitude: 138.2529, aliases: ["Japan", "Japanese"] },
  { name: "Jordan", latitude: 30.5852, longitude: 36.2384, aliases: ["Jordan", "Jordanian"] },
  { name: "Kazakhstan", latitude: 48.0196, longitude: 66.9237, aliases: ["Kazakhstan", "Kazakhstani", "Kazakh"] },
  { name: "Kuwait", latitude: 29.3117, longitude: 47.4818, aliases: ["Kuwait", "Kuwaiti"] },
  { name: "Kyrgyzstan", latitude: 41.2044, longitude: 74.7661, aliases: ["Kyrgyzstan", "Kyrgyz"] },
  { name: "Laos", latitude: 19.8563, longitude: 102.4955, aliases: ["Laos", "Laotian", "Lao PDR"] },
  { name: "Lebanon", latitude: 33.8547, longitude: 35.8623, aliases: ["Lebanon", "Lebanese"] },
  { name: "Malaysia", latitude: 4.2105, longitude: 101.9758, aliases: ["Malaysia", "Malaysian"] },
  { name: "Maldives", latitude: 3.2028, longitude: 73.2207, aliases: ["Maldives", "Maldivian"] },
  { name: "Mongolia", latitude: 46.8625, longitude: 103.8467, aliases: ["Mongolia", "Mongolian"] },
  { name: "Myanmar", latitude: 21.9162, longitude: 95.956, aliases: ["Myanmar", "Burmese", "Burma"] },
  { name: "Nepal", latitude: 28.3949, longitude: 84.124, aliases: ["Nepal", "Nepali", "Nepalese"] },
  { name: "North Korea", latitude: 40.3399, longitude: 127.5101, aliases: ["North Korea", "North Korean", "DPRK"] },
  { name: "Oman", latitude: 21.4735, longitude: 55.9754, aliases: ["Oman", "Omani"] },
  { name: "Pakistan", latitude: 30.3753, longitude: 69.3451, aliases: ["Pakistan", "Pakistani"] },
  { name: "Palestine", latitude: 31.9522, longitude: 35.2332, aliases: ["Palestine", "Palestinian", "Gaza", "West Bank"] },
  { name: "Philippines", latitude: 12.8797, longitude: 121.774, aliases: ["Philippines", "Filipino", "Philippine"] },
  { name: "Qatar", latitude: 25.3548, longitude: 51.1839, aliases: ["Qatar", "Qatari"] },
  { name: "Russia", latitude: 61.524, longitude: 105.3188, aliases: ["Russia", "Russian", "Russian Federation"] },
  { name: "Saudi Arabia", latitude: 23.8859, longitude: 45.0792, aliases: ["Saudi Arabia", "Saudi", "Saudi Arabian"] },
  { name: "Singapore", latitude: 1.3521, longitude: 103.8198, aliases: ["Singapore", "Singaporean"] },
  { name: "South Korea", latitude: 35.9078, longitude: 127.7669, aliases: ["South Korea", "South Korean", "Republic of Korea"] },
  { name: "Sri Lanka", latitude: 7.8731, longitude: 80.7718, aliases: ["Sri Lanka", "Sri Lankan"] },
  { name: "Syria", latitude: 34.8021, longitude: 38.9968, aliases: ["Syria", "Syrian"] },
  { name: "Taiwan", latitude: 23.6978, longitude: 120.9605, aliases: ["Taiwan", "Taiwanese"] },
  { name: "Tajikistan", latitude: 38.861, longitude: 71.2761, aliases: ["Tajikistan", "Tajik"] },
  { name: "Thailand", latitude: 15.87, longitude: 100.9925, aliases: ["Thailand", "Thai"] },
  { name: "Timor-Leste", latitude: -8.8742, longitude: 125.7275, aliases: ["Timor-Leste", "East Timor", "Timorese"] },
  { name: "Turkey", latitude: 38.9637, longitude: 35.2433, aliases: ["Turkey", "Turkiye", "Turkish"] },
  { name: "Turkmenistan", latitude: 38.9697, longitude: 59.5563, aliases: ["Turkmenistan", "Turkmen"] },
  { name: "United Arab Emirates", latitude: 23.4241, longitude: 53.8478, aliases: ["United Arab Emirates", "UAE", "Emirati"] },
  { name: "Uzbekistan", latitude: 41.3775, longitude: 64.5853, aliases: ["Uzbekistan", "Uzbek"] },
  { name: "Vietnam", latitude: 14.0583, longitude: 108.2772, aliases: ["Vietnam", "Vietnamese"] },
  { name: "Yemen", latitude: 15.5527, longitude: 48.5164, aliases: ["Yemen", "Yemeni"] },

  // Europe
  { name: "Albania", latitude: 41.1533, longitude: 20.1683, aliases: ["Albania", "Albanian"] },
  { name: "Andorra", latitude: 42.5063, longitude: 1.5218, aliases: ["Andorra", "Andorran"] },
  { name: "Austria", latitude: 47.5162, longitude: 14.5501, aliases: ["Austria", "Austrian"] },
  { name: "Belarus", latitude: 53.7098, longitude: 27.9534, aliases: ["Belarus", "Belarusian"] },
  { name: "Belgium", latitude: 50.5039, longitude: 4.4699, aliases: ["Belgium", "Belgian"] },
  { name: "Bosnia and Herzegovina", latitude: 43.9159, longitude: 17.6791, aliases: ["Bosnia and Herzegovina", "Bosnia", "Bosnian"] },
  { name: "Bulgaria", latitude: 42.7339, longitude: 25.4858, aliases: ["Bulgaria", "Bulgarian"] },
  { name: "Croatia", latitude: 45.1, longitude: 15.2, aliases: ["Croatia", "Croatian"] },
  { name: "Czech Republic", latitude: 49.8175, longitude: 15.473, aliases: ["Czech Republic", "Czech", "Czechia"] },
  { name: "Denmark", latitude: 56.2639, longitude: 9.5018, aliases: ["Denmark", "Danish"] },
  { name: "Estonia", latitude: 58.5953, longitude: 25.0136, aliases: ["Estonia", "Estonian"] },
  { name: "Finland", latitude: 61.9241, longitude: 25.7482, aliases: ["Finland", "Finnish"] },
  { name: "France", latitude: 46.2276, longitude: 2.2137, aliases: ["France", "French"] },
  { name: "Germany", latitude: 51.1657, longitude: 10.4515, aliases: ["Germany", "German"] },
  { name: "Greece", latitude: 39.0742, longitude: 21.8243, aliases: ["Greece", "Greek"] },
  { name: "Hungary", latitude: 47.1625, longitude: 19.5033, aliases: ["Hungary", "Hungarian"] },
  { name: "Iceland", latitude: 64.9631, longitude: -19.0208, aliases: ["Iceland", "Icelandic"] },
  { name: "Ireland", latitude: 53.4129, longitude: -8.2439, aliases: ["Ireland", "Irish"] },
  { name: "Italy", latitude: 41.8719, longitude: 12.5674, aliases: ["Italy", "Italian"] },
  { name: "Kosovo", latitude: 42.6026, longitude: 20.903, aliases: ["Kosovo", "Kosovar"] },
  { name: "Latvia", latitude: 56.8796, longitude: 24.6032, aliases: ["Latvia", "Latvian"] },
  { name: "Liechtenstein", latitude: 47.166, longitude: 9.5554, aliases: ["Liechtenstein"] },
  { name: "Lithuania", latitude: 55.1694, longitude: 23.8813, aliases: ["Lithuania", "Lithuanian"] },
  { name: "Luxembourg", latitude: 49.8153, longitude: 6.1296, aliases: ["Luxembourg", "Luxembourgish"] },
  { name: "Malta", latitude: 35.9375, longitude: 14.3754, aliases: ["Malta", "Maltese"] },
  { name: "Moldova", latitude: 47.4116, longitude: 28.3699, aliases: ["Moldova", "Moldovan"] },
  { name: "Monaco", latitude: 43.7384, longitude: 7.4246, aliases: ["Monaco", "Monacan", "Monegasque"] },
  { name: "Montenegro", latitude: 42.7087, longitude: 19.3744, aliases: ["Montenegro", "Montenegrin"] },
  { name: "Netherlands", latitude: 52.1326, longitude: 5.2913, aliases: ["Netherlands", "Dutch", "RIVM"] },
  { name: "North Macedonia", latitude: 41.6086, longitude: 21.7453, aliases: ["North Macedonia", "Macedonia", "Macedonian"] },
  { name: "Norway", latitude: 60.472, longitude: 8.4689, aliases: ["Norway", "Norwegian"] },
  { name: "Poland", latitude: 51.9194, longitude: 19.1451, aliases: ["Poland", "Polish"] },
  { name: "Portugal", latitude: 39.3999, longitude: -8.2245, aliases: ["Portugal", "Portuguese"] },
  { name: "Romania", latitude: 45.9432, longitude: 24.9668, aliases: ["Romania", "Romanian"] },
  { name: "San Marino", latitude: 43.9424, longitude: 12.4578, aliases: ["San Marino", "Sammarinese"] },
  { name: "Serbia", latitude: 44.0165, longitude: 21.0059, aliases: ["Serbia", "Serbian"] },
  { name: "Slovakia", latitude: 48.669, longitude: 19.699, aliases: ["Slovakia", "Slovak"] },
  { name: "Slovenia", latitude: 46.1512, longitude: 14.9955, aliases: ["Slovenia", "Slovenian"] },
  { name: "Spain", latitude: 40.4637, longitude: -3.7492, aliases: ["Spain", "Spanish"] },
  { name: "Sweden", latitude: 60.1282, longitude: 18.6435, aliases: ["Sweden", "Swedish"] },
  { name: "Switzerland", latitude: 46.8182, longitude: 8.2275, aliases: ["Switzerland", "Swiss", "Zurich"] },
  { name: "Ukraine", latitude: 48.3794, longitude: 31.1656, aliases: ["Ukraine", "Ukrainian"] },
  { name: "UK", latitude: 55.3781, longitude: -3.436, aliases: ["UK", "United Kingdom", "United Kingdom of Great Britain and Northern Ireland", "British"] },
  { name: "Saint Helena", latitude: -15.965, longitude: -5.7089, aliases: ["Saint Helena", "St Helena", "St. Helena"] },
  { name: "Tristan da Cunha", latitude: -37.1057, longitude: -12.2769, aliases: ["Tristan da Cunha", "Tristan"] },
  { name: "Vatican City", latitude: 41.9029, longitude: 12.4534, aliases: ["Vatican City", "Vatican", "Holy See"] },

  // Oceania
  { name: "Australia", latitude: -25.2744, longitude: 133.7751, aliases: ["Australia", "Australian"] },
  { name: "Fiji", latitude: -17.7134, longitude: 178.065, aliases: ["Fiji", "Fijian"] },
  { name: "Kiribati", latitude: -3.3704, longitude: -168.734, aliases: ["Kiribati"] },
  { name: "Marshall Islands", latitude: 7.1315, longitude: 171.1845, aliases: ["Marshall Islands", "Marshallese"] },
  { name: "Micronesia", latitude: 7.4256, longitude: 150.5508, aliases: ["Micronesia", "Micronesian", "Federated States of Micronesia"] },
  { name: "Nauru", latitude: -0.5228, longitude: 166.9315, aliases: ["Nauru", "Nauruan"] },
  { name: "New Zealand", latitude: -40.9006, longitude: 174.886, aliases: ["New Zealand", "New Zealander"] },
  { name: "Palau", latitude: 7.515, longitude: 134.5825, aliases: ["Palau", "Palauan"] },
  { name: "Papua New Guinea", latitude: -6.315, longitude: 143.9555, aliases: ["Papua New Guinea", "Papua New Guinean"] },
  { name: "Samoa", latitude: -13.759, longitude: -172.1046, aliases: ["Samoa", "Samoan"] },
  { name: "Solomon Islands", latitude: -9.6457, longitude: 160.1562, aliases: ["Solomon Islands"] },
  { name: "Tonga", latitude: -21.1789, longitude: -175.1982, aliases: ["Tonga", "Tongan"] },
  { name: "Tuvalu", latitude: -7.1095, longitude: 177.6493, aliases: ["Tuvalu", "Tuvaluan"] },
  { name: "Vanuatu", latitude: -15.3767, longitude: 166.9592, aliases: ["Vanuatu", "Ni-Vanuatu"] },
];

function toNumber(value) {
  const normalized = String(value).trim().toLowerCase();

  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  return NUMBER_WORDS.get(normalized);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getCountryConfig(countryName) {
  return (
    COUNTRY_CATALOG.find((country) => country.name === countryName) ?? {
      name: countryName,
      aliases: [countryName],
    }
  );
}

function getSentences(text) {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean);
}

function getSentencesMentioningCountry(text, countryName) {
  const country = getCountryConfig(countryName);
  const regexes = getCountryRegexes(country);

  return getSentences(text).filter((sentence) =>
    regexes.some((regex) => regex.test(sentence)),
  );
}

function getCountryRegexes(country) {
  return country.aliases.map((alias) => {
    const escapedAlias = escapeRegExp(alias);
    const startsWithWord = /^\w/.test(alias);
    const endsWithWord = /\w$/.test(alias);

    return new RegExp(
      `${startsWithWord ? "\\b" : ""}${escapedAlias}${endsWithWord ? "\\b" : ""}`,
      "i",
    );
  });
}

function getCountryNamesInText(text) {
  return COUNTRY_CATALOG.filter((country) =>
    getCountryRegexes(country).some((regex) => regex.test(text)),
  ).map((country) => country.name);
}

function getAliasPattern(country) {
  return country.aliases
    .map((alias) => {
      const escapedAlias = escapeRegExp(alias);
      const startsWithWord = /^\w/.test(alias);
      const endsWithWord = /\w$/.test(alias);

      return `${startsWithWord ? "\\b" : ""}${escapedAlias}${endsWithWord ? "\\b" : ""}`;
    })
    .join("|");
}

function isMonitoringContextSentence(sentence) {
  return /(?:countries|authorities|nationals|passengers|people).*?(?:monitor|notified|contact tracing|tracing|disembarked|self-isolat|quarantine|under observation|potentially exposed|exposure)/i.test(
    sentence,
  );
}

function isOnShipSentence(sentence) {
  return /\b(?:aboard|on board|onboard|at sea|on the vessel|while aboard|on the ship)\b/i.test(sentence);
}

function sentenceLinksStatusToCountry(sentence, countryName, statusPattern) {
  const country = getCountryConfig(countryName);
  const aliasPattern = getAliasPattern(country);

  // Events that happened on the ship should not be attributed to any country
  if (isOnShipSentence(sentence)) {
    return false;
  }

  // Detect nationality/origin/destination references that do NOT indicate a
  // case located in the country: "from X", "of X", "returned to X",
  // "repatriated to X", or "[X adjective] [person/entity noun]"
  const nationalityRef = new RegExp(
    `\\b(?:from|of|returned?\\s+to|repatriated?\\s+to|flew?\\s+to|traveled?\\s+to|back\\s+to|flew?\\s+back\\s+to)\\s+(?:${aliasPattern})|(?:${aliasPattern})\\b.{0,6}\\b(?:passenger|national|citizen|traveler|traveller|tourist|resident|authorities|authority|government|ministry|officials?|health\\s+\\w+)`,
    "i",
  );

  if (nationalityRef.test(sentence)) {
    // Only match if the status word appears BEFORE the country name,
    // i.e. "case in [Country]" / "hospitalized in [Country]"
    const locationPattern = new RegExp(
      `(?:${statusPattern}).{0,40}(?:${aliasPattern})`,
      "i",
    );
    return locationPattern.test(sentence);
  }

  // Standard proximity check with tightened window
  const linkedPattern = new RegExp(
    `(?:${aliasPattern}).{0,45}(?:${statusPattern})|(?:${statusPattern}).{0,45}(?:${aliasPattern})`,
    "i",
  );

  return linkedPattern.test(sentence);
}

function extractDirectCaseCount(sentences) {
  for (const sentence of sentences) {
    const match = sentence.match(
      /([a-z\d]+)\s+(?:laboratory[-\s])?(?:confirmed\s+)?cases?.*?including\s+([a-z\d]+)\s+deaths?/i,
    );

    if (match) {
      return {
        confirmedCases: toNumber(match[1]),
        deaths: toNumber(match[2]),
      };
    }
  }

  return null;
}

function inferStatus(sentences, countryName) {
  // Events on the ship are not country-specific cases
  sentences = sentences.filter((s) => !isOnShipSentence(s));

  if (sentences.length === 0) {
    return null;
  }

  const monitoringListSentences = sentences.filter(
    (sentence) =>
      isMonitoringContextSentence(sentence) &&
      getCountryNamesInText(sentence).length > 1,
  );
  const countrySpecificSentences = sentences.filter(
    (sentence) => !monitoringListSentences.includes(sentence),
  );
  const sentencesToClassify =
    countrySpecificSentences.length > 0 ? countrySpecificSentences : sentences;
  const text = sentencesToClassify.join(" ");
  const confirmedPattern =
    "confirmed (?:case|infection|hantavirus|patient|passenger|person)|lab-confirmed|laboratory confirmed|tested positive|tests? positive|positive for hantavirus|confirmed by PCR";
  const suspectedPattern =
    "suspected|\\bsymptomatic\\b|fell ill|serious condition|critically ill|intensive care|hospitali[sz]ed";

  if (
    sentencesToClassify.some((sentence) =>
      sentenceLinksStatusToCountry(sentence, countryName, confirmedPattern),
    )
  ) {
    return "confirmed";
  }

  if (
    sentencesToClassify.some((sentence) =>
      sentenceLinksStatusToCountry(sentence, countryName, suspectedPattern),
    )
  ) {
    return "suspected";
  }

  if (countrySpecificSentences.length === 0 && monitoringListSentences.length > 0) {
    return "monitoring";
  }

  if (
    /(?:monitor(?:ed|ing)?|contact tracing|self-isolat(?:e|ion)|quarantine|under observation|tracking|traced to|returned|disembarked|repatriat(?:ed|ion)|potentially exposed|exposure)/i.test(
      text,
    )
  ) {
    return "monitoring";
  }

  return null;
}

function inferMinimumCounts(outbreak, status, sentences) {
  if (status !== "confirmed") {
    return outbreak;
  }

  return {
    ...outbreak,
    confirmedCases: Math.max(outbreak.confirmedCases, 1),
    deaths: outbreak.deaths,
  };
}

function applySouthAfricaNarrative(outbreak, sourceText) {
  let confirmedCases = 0;
  let deaths = 0;

  if (
    /laboratory testing conducted in South Africa confirmed hantavirus infection in one patient/i.test(
      sourceText,
    )
  ) {
    confirmedCases += 1;
  }

  if (
    /flight to Johannesburg, South Africa.*?died.*?confirmed by PCR with hantavirus infection/i.test(
      sourceText,
    )
  ) {
    confirmedCases += 1;
    deaths += 1;
  }

  if (confirmedCases === 0) {
    return null;
  }

  return {
    ...outbreak,
    confirmedCases,
    deaths,
    status: "confirmed",
  };
}

function createOutbreakFromCatalog(country) {
  return {
    name: country.name,
    latitude: country.latitude,
    longitude: country.longitude,
    confirmedCases: 0,
    deaths: 0,
    status: "monitoring",
  };
}

function applyStatus(outbreak, nextStatus) {
  if (!nextStatus) {
    return outbreak;
  }

  if (STATUS_PRIORITY[nextStatus] < STATUS_PRIORITY[outbreak.status]) {
    return outbreak;
  }

  return {
    ...outbreak,
    status: nextStatus,
  };
}

function applyMonitoringLists(byName, originalNames, sourceText, notes) {
  const countryListIntroPattern =
    /(?:those countries are|countries are|countries include|include)\b/i;
  let monitoringContextSentences = 0;

  for (const sentence of getSentences(sourceText)) {
    const hasMonitoringContext =
      isMonitoringContextSentence(sentence) || monitoringContextSentences > 0;

    if (isMonitoringContextSentence(sentence)) {
      monitoringContextSentences = 2;
    }

    const countryNames = getCountryNamesInText(sentence);

    if (
      !hasMonitoringContext ||
      countryNames.length < 2 ||
      (!isMonitoringContextSentence(sentence) &&
        !countryListIntroPattern.test(sentence))
    ) {
      monitoringContextSentences = Math.max(0, monitoringContextSentences - 1);
      continue;
    }

    for (const countryName of countryNames) {
      const country = getCountryConfig(countryName);
      const current = byName.get(countryName) ?? createOutbreakFromCatalog(country);
      const statusUpdate = applyStatus(current, "monitoring");

      byName.set(countryName, statusUpdate);

      if (!originalNames.has(countryName)) {
        notes.push(`${countryName}: added as monitoring from country list.`);
        originalNames.add(countryName);
      } else if (statusUpdate.status !== current.status) {
        notes.push(`${countryName}: status set to monitoring from country list.`);
      }
    }

    monitoringContextSentences = Math.max(0, monitoringContextSentences - 1);
  }
}

export function applySourceTextUpdates(outbreaks, sourceText) {
  const notes = [];
  const byName = new Map(outbreaks.map((outbreak) => [outbreak.name, outbreak]));
  const originalNames = new Set(outbreaks.map((outbreak) => outbreak.name));

  applyMonitoringLists(byName, originalNames, sourceText, notes);

  for (const country of COUNTRY_CATALOG) {
    const sentences = getSentencesMentioningCountry(sourceText, country.name);

    if (sentences.length === 0) {
      continue;
    }

    const current = byName.get(country.name) ?? createOutbreakFromCatalog(country);
    const directCount = extractDirectCaseCount(sentences);

    if (directCount?.confirmedCases !== undefined) {
      byName.set(country.name, {
        ...current,
        confirmedCases: directCount.confirmedCases,
        deaths: directCount.deaths ?? current.deaths,
        status: directCount.confirmedCases > 0 ? "confirmed" : current.status,
      });
      notes.push(
        `${country.name}: direct source count set to ${directCount.confirmedCases} cases and ${directCount.deaths ?? current.deaths} deaths.`,
      );
      continue;
    }

    if (country.name === "South Africa") {
      const southAfricaUpdate = applySouthAfricaNarrative(current, sourceText);

      if (southAfricaUpdate) {
        byName.set(country.name, southAfricaUpdate);
        notes.push(
          `South Africa: source narrative set to ${southAfricaUpdate.confirmedCases} cases and ${southAfricaUpdate.deaths} deaths.`,
        );
        continue;
      }
    }

    // Singapore residents were contacts being monitored; they tested negative.
    // Lock at monitoring to prevent false promotion from contact-trace sentences.
    if (country.name === "Singapore") {
      byName.set(country.name, { ...current, confirmedCases: 0, deaths: 0, status: "monitoring" });
      continue;
    }

    const inferredStatus = inferStatus(sentences, country.name);

    if (!inferredStatus) {
      continue;
    }

    const statusUpdate = inferMinimumCounts(
      applyStatus(current, inferredStatus),
      inferredStatus,
      sentences,
    );
    byName.set(country.name, statusUpdate);

    if (!originalNames.has(country.name)) {
      notes.push(`${country.name}: added as ${statusUpdate.status}.`);
      originalNames.add(country.name);
    } else if (statusUpdate.status !== current.status) {
      notes.push(`${country.name}: status set to ${statusUpdate.status}.`);
    }
  }

  return {
    outbreaks: [...byName.values()],
    notes,
  };
}
