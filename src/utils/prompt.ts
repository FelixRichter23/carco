export function buildResearchPrompt(modelQuery: string): string {
  const target = modelQuery.trim() || 'Toyota Corolla Touring Sports 2.0 Hybrid, ~2021';

  return `Use web search to research realistic used-car market figures for Germany AND real, direct photo URLs for the following vehicle model:
"${target}"

Use German market sources as reference:
- Used purchase price: typical clean-condition German market price (mobile.de / AutoScout24, ~40,000–70,000 km) in EUR
- Running cost per km (€/km): realistic ADAC Autokosten-style estimate including fuel/energy, maintenance, tires, and wear
- Annual insurance (€/year): realistic German Haftpflicht + Teilkasko/Vollkasko estimate based on typical Typklassen (e.g., SF10, 15,000 km/yr)
- Annual vehicle tax (€/year): German Kfz-Steuer in EUR (0 for eligible EVs)
- Reliability index (0–100): grounded in TÜV-Report / ADAC Pannenstatistik
- Value retention index (0–100): 100 = very low depreciation / strong German resale demand
- Comfort & equipment index (0–100): cabin quality, NVH, driver assists, ride comfort
- Practicality & space index (0–100): trunk space, rear seating, daily usability
- Notes: concise English buyer checklist covering known weak spots, recommended engine/trim, and what to inspect during a test drive

IMAGE SEARCH REQUIREMENTS (IMPORTANT):
- Actively search the web for 3 to 5 real, publicly accessible, direct image URLs of the exact model/generation ("${target}") — ideally front 3/4 exterior, rear/side exterior, and interior/cockpit.
- Every URL in "images" MUST be a direct image file link (ending in .jpg, .jpeg, .png, or .webp) that loads cleanly in an <img> tag — prioritize Wikimedia Commons direct upload URLs (https://upload.wikimedia.org/wikipedia/commons/...) or official pressroom / CDN image URLs that do not block hotlinking.
- Do NOT return HTML webpage URLs (such as wikipedia.org/wiki/File:... or autoscout24 listing pages), do NOT invent or guess URLs, and do NOT use placeholder domains like example.com.
- Only fall back to [] if web search is completely unavailable in your environment.

Return ONLY valid JSON (no markdown fences, no commentary) matching this exact schema:
{
  "brandModel": "string (e.g. Toyota Corolla Touring Sports 2.0 Hybrid)",
  "year": "string (e.g. 2021 (E210))",
  "bodyStyle": "Sedan | Wagon | SUV | Hatchback | Coupe",
  "drivetrain": "Petrol | Diesel | Hybrid | Electric",
  "transmission": "Automatic | Manual",
  "horsepower": 184,
  "images": [
    "https://upload.wikimedia.org/wikipedia/commons/.../exterior-front.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/.../exterior-rear.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/.../interior.jpg"
  ],
  "estimatedPrice": 21500,
  "costPerKm": 0.34,
  "insurancePerYear": 680,
  "taxPerYear": 54,
  "reliabilityIndex": 89,
  "valueRetentionIndex": 82,
  "comfortIndex": 76,
  "practicalityIndex": 88,
  "notes": "Known issues, recommended engine/trim, and key buyer inspection points in English."
}`;
}
