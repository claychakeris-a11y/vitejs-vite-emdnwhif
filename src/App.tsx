// @ts-nocheck
// @ts-nocheck
import { useState, useRef } from "react";

const STRIPE = {
  basic: "https://buy.stripe.com/bJe5kDfwM5Og8CR82KcAo00",
  pro:   "https://buy.stripe.com/6oUfZh84k4Kcf1f3MucAo01",
  elite: "https://buy.stripe.com/00w5kD98o2C4dXb6YGcAo02",
};

const TIERS = {
  S: { color: "#b91c1c", bg: "#fef2f2", border: "#fca5a5", label: "S Tier", sub: "Must Flip — Instant Profit" },
  A: { color: "#c2410c", bg: "#fff7ed", border: "#fdba74", label: "A Tier", sub: "Strong Flip — Great Margins" },
  B: { color: "#a16207", bg: "#fefce8", border: "#fde047", label: "B Tier", sub: "Solid Flip — Worth Your Time" },
  C: { color: "#15803d", bg: "#f0fdf4", border: "#86efac", label: "C Tier", sub: "Decent Flip — Moderate Return" },
  D: { color: "#1d4ed8", bg: "#eff6ff", border: "#93c5fd", label: "D Tier", sub: "Weak Flip — Low Margin" },
  F: { color: "#4b5563", bg: "#f9fafb", border: "#d1d5db", label: "F Tier", sub: "Skip It — Not Worth Flipping" },
};

const PLATFORMS = [
  { name: "eBay",                emoji: "🛍️", url: "https://www.ebay.com",                 fee: 0.13 },
  { name: "Poshmark",            emoji: "👗", url: "https://www.poshmark.com",             fee: 0.20 },
  { name: "Depop",               emoji: "🎨", url: "https://www.depop.com",                fee: 0.10 },
  { name: "Mercari",             emoji: "📦", url: "https://www.mercari.com",              fee: 0.10 },
  { name: "StockX",              emoji: "👟", url: "https://www.stockx.com",               fee: 0.09 },
  { name: "GOAT",                emoji: "✅", url: "https://www.goat.com",                 fee: 0.09 },
  { name: "Facebook Marketplace",emoji: "📍", url: "https://www.facebook.com/marketplace", fee: 0.00 },
];

const PLANS = {
  basic: {
    name: "Basic", price: "$2.99", period: "/month", color: "#15803d", bg: "#f0fdf4", stripe: STRIPE.basic,
    features: ["✅ Instant tier ratings (S through F)","✅ Resale prices across 7 platforms","✅ Condition-based price adjustments","✅ Previously rated item history","❌ Photo upload","❌ Profit & fee estimates","❌ Direct platform listing links","❌ Expert reseller tips"],
    ratingLimit: 25, hasPhoto: false, hasProfit: false, hasTips: false, hasLinks: false,
  },
  pro: {
    name: "Pro", price: "$10", period: "/month", color: "#c2410c", bg: "#fff7ed", stripe: STRIPE.pro,
    features: ["✅ Everything in Basic","✅ Photo upload for visual analysis","✅ Profit estimates after all fees","✅ Direct links to list on every platform","✅ Unlimited ratings","✅ Platform fee breakdowns","❌ Priority new features","❌ Advanced expert tips database"],
    ratingLimit: 99999, hasPhoto: true, hasProfit: true, hasTips: false, hasLinks: true,
  },
  elite: {
    name: "Elite", price: "$15", period: "/month", color: "#6d28d9", bg: "#f5f3ff", stripe: STRIPE.elite,
    features: ["✅ Everything in Pro","✅ Full expert reseller tips database","✅ Seasonal trend analysis","✅ Best platform recommendations","✅ Advanced condition pricing","✅ Priority access to new features","✅ Unlimited ratings","✅ Photo AI analysis"],
    ratingLimit: 99999, hasPhoto: true, hasProfit: true, hasTips: true, hasLinks: true,
  },
};

// Condition multipliers with context
const CONDITIONS = {
  deadstock: { mult: 1.0,  label: "💎 Deadstock / New",    note: "Full market value — never worn, tags on" },
  likenew:   { mult: 0.88, label: "✨ Like New",            note: "Worn once or twice, no visible flaws" },
  good:      { mult: 0.68, label: "👍 Good Used",           note: "Normal wear, minor flaws, clean" },
  worn:      { mult: 0.45, label: "👎 Visible Wear",        note: "Fading, pilling, or light scuffs visible" },
  damaged:   { mult: 0.22, label: "⚠️ Stains / Damage",    note: "Stains, rips, or significant damage" },
};

// Detailed item database
const ITEMS = [
  // S TIER — Grails
  { keys:["supreme box logo","bx logo hoodie"], tier:"S", brand:"Supreme", category:"Streetwear",
    desc:"The Supreme Box Logo Hoodie is one of the most coveted streetwear items in existence. Demand always outstrips supply — buyers wait months for authentic pairs. Colorway and season dramatically affect price.",
    platforms:{"eBay":"$450–$950","StockX":"$500–$1,000","GOAT":"$480–$980","Depop":"$420–$900","Poshmark":"$400–$880"},
    buy:"$120–$220", profit:"$280–$650", bestPlatform:"StockX",
    tips:["Authenticate before listing — fakes are extremely common","Season and colorway matter enormously: FW box logos fetch more than SS","List within 48 hours of acquiring — hype windows close fast"] },

  { keys:["travis scott","travis scott jordan","travis scott nike","cactus jack"], tier:"S", brand:"Nike/Travis Scott", category:"Sneakers",
    desc:"Travis Scott collaborations are among the most valuable resale items on the market. Reverse Swoosh designs command massive premiums. Authentication is essential — buyer scrutiny is intense.",
    platforms:{"eBay":"$500–$1,500","StockX":"$550–$1,600","GOAT":"$540–$1,580","Depop":"$480–$1,400"},
    buy:"$150–$350", profit:"$300–$1,000", bestPlatform:"StockX",
    tips:["StockX authentication protects you and commands higher prices","Photograph every detail — lace tips, insoles, box label","Never clean soles with bleach — yellowing destroys value"] },

  { keys:["off-white","off white jordan","off white nike","off white the ten"], tier:"S", brand:"Off-White", category:"Sneakers",
    desc:"Off-White x Nike 'The Ten' collection remains highly sought after years after release. Virgil Abloh's legacy has only increased demand. Condition and completeness of original packaging are critical.",
    platforms:{"eBay":"$600–$2,000","StockX":"$650–$2,200","GOAT":"$630–$2,100","Depop":"$550–$1,800"},
    buy:"$200–$500", profit:"$350–$1,200", bestPlatform:"StockX",
    tips:["Original zip-ties and extra laces add significant value","Photograph the Helvetica text detailing carefully","Deadstock pairs in original box command 3x worn pairs"] },

  { keys:["jordan 1 chicago","jordan 1 bred","jordan 1 royal","jordan 1 og","jordan 1 shadow","jordan 1 mocha"], tier:"S", brand:"Nike", category:"Sneakers",
    desc:"OG colorway Jordan 1s are the pinnacle of sneaker collecting. Chicago, Bred, Royal, and Shadow releases hold value exceptionally well. Authenticity and condition are everything to serious collectors.",
    platforms:{"eBay":"$350–$800","StockX":"$380–$850","GOAT":"$370–$830","Depop":"$320–$750","Poshmark":"$300–$720"},
    buy:"$120–$200", profit:"$180–$550", bestPlatform:"StockX",
    tips:["OG colorways hold value better than GR releases","Box and all accessories must be present for top dollar","Creasing dramatically reduces value — stuff with shoe trees"] },

  { keys:["louis vuitton","lv bag","gucci bag","prada bag","chanel bag","hermes","birkin"], tier:"S", brand:"Luxury", category:"Luxury",
    desc:"Authentic luxury goods maintain exceptional resale value. Handbags especially appreciate over time. Authentication is absolutely critical — buyers will verify through third-party services and counterfeits are rampant.",
    platforms:{"eBay":"$500–$5,000","Poshmark":"$480–$4,800","Depop":"$450–$4,500","Mercari":"$400–$4,000"},
    buy:"$150–$1,500", profit:"$200–$2,500", bestPlatform:"Poshmark",
    tips:["Get third-party authentication (Entrupy or Real Authentication)","Original dustbag, box, and receipt add 20-40% to value","Never clean leather yourself — professionals only"] },

  // A TIER
  { keys:["air jordan 1","jordan 1","aj1","jordan retro 1"], tier:"A", brand:"Nike", category:"Sneakers",
    desc:"Air Jordan 1s have one of the most consistent resale markets in footwear. Non-OG colorways still command solid premiums. Condition and size affect prices significantly — larger sizes (11+) often fetch more.",
    platforms:{"eBay":"$160–$380","StockX":"$170–$400","GOAT":"$165–$395","Depop":"$140–$350","Poshmark":"$130–$340","Mercari":"$125–$320"},
    buy:"$80–$130", profit:"$60–$220", bestPlatform:"StockX",
    tips:["Men's sizes 9–11 are most liquid but 12+ fetch premiums","Lace swaps lower value — keep original laces","Creasing and sole yellowing are the biggest value killers"] },

  { keys:["nike dunk low","dunk low","sb dunk","dunk high","nike dunk"], tier:"A", brand:"Nike", category:"Sneakers",
    desc:"Nike Dunks remain one of the hottest resale categories. Pandas, University Blues, and SB collabs lead the market. The Dunk market has softened slightly from its peak but strong colorways still perform well.",
    platforms:{"eBay":"$90–$260","StockX":"$100–$280","GOAT":"$95–$270","Depop":"$85–$240","Mercari":"$80–$230","Poshmark":"$85–$245"},
    buy:"$40–$100", profit:"$35–$160", bestPlatform:"StockX",
    tips:["Pandas and UNC colorways are the most liquid","SB collabs command 2-3x general release prices","Size 8.5W sells as men's 7 — opens more buyers"] },

  { keys:["yeezy","adidas yeezy","yeezy 350","boost 350","foam runner","yeezy slide","yeezy 700"], tier:"A", brand:"Adidas", category:"Sneakers",
    desc:"Yeezys remain strong resale performers despite increased supply. Zebra, Beluga, and Natural colorways are the most consistent earners. Condition and sizing affect price significantly.",
    platforms:{"eBay":"$140–$350","StockX":"$150–$380","GOAT":"$145–$370","Depop":"$130–$330","Mercari":"$120–$310"},
    buy:"$60–$120", profit:"$50–$200", bestPlatform:"StockX",
    tips:["Zebra and Beluga colorways are the safest bets","Foam Runners in earth tones sell fastest","Avoid cleaning with harsh chemicals — midsole crumbles"] },

  { keys:["supreme","supreme hoodie","supreme jacket","supreme tee","supreme shirt","supreme sweatshirt"], tier:"A", brand:"Supreme", category:"Streetwear",
    desc:"Supreme pieces beyond the box logo hold solid resale value especially outerwear and hoodies. FW (Fall/Winter) pieces command more than SS (Spring/Summer). Collab pieces fetch the highest premiums.",
    platforms:{"eBay":"$100–$400","Depop":"$110–$420","Poshmark":"$95–$380","Mercari":"$90–$360","StockX":"$120–$450"},
    buy:"$40–$120", profit:"$50–$250", bestPlatform:"Depop",
    tips:["FW drops fetch 30-40% more than SS equivalents","Collab pieces (Nike, The North Face, Timberland) sell fastest","Tags must be present — no tag drops value by 15-20%"] },

  { keys:["patagonia","synchilla","snap-t","patagonia fleece","retro pile","patagonia jacket"], tier:"A", brand:"Patagonia", category:"Outerwear",
    desc:"Vintage Patagonia is one of the strongest outdoor resale categories right now. Synchilla and retro pile fleeces lead demand. Made in USA tags and 90s-era pieces command the biggest premiums.",
    platforms:{"eBay":"$80–$200","Depop":"$90–$220","Poshmark":"$75–$190","Mercari":"$70–$180","Facebook Marketplace":"$60–$150"},
    buy:"$12–$30", profit:"$45–$160", bestPlatform:"Depop",
    tips:["Made in USA tags add $40-60 to value instantly","Snap-T pulls fetch more than full-zip styles","Earth tones and bright 90s colors outsell neutrals"] },

  { keys:["carhartt","detroit jacket","chore coat","carhartt wip","carhartt work jacket","active jacket"], tier:"A", brand:"Carhartt", category:"Workwear",
    desc:"Carhartt is experiencing a sustained popularity surge in both streetwear and workwear markets. Detroit Jackets and chore coats are the most sought-after pieces. Heavy fading and wear paradoxically adds character and value.",
    platforms:{"eBay":"$65–$210","Depop":"$75–$230","Poshmark":"$60–$195","Mercari":"$55–$180","Facebook Marketplace":"$50–$160"},
    buy:"$15–$40", profit:"$35–$160", bestPlatform:"Depop",
    tips:["WIP (Work In Progress) sub-label pieces fetch 40% more","Heavy canvas Detroit Jackets outsell lighter pieces","Faded naturally worn pieces are preferred — don't try to clean too much"] },

  { keys:["band tee","vintage tee","rap tee","concert tee","band t-shirt","tour tee","bootleg tee"], tier:"A", brand:"Vintage", category:"Tops",
    desc:"Vintage band and rap tees are among the most lucrative thrift flips available. 80s and 90s originals in good condition fetch serious money. Single-stitch construction is the key indicator of authentic vintage pieces.",
    platforms:{"eBay":"$55–$350","Depop":"$65–$380","Poshmark":"$50–$320","Mercari":"$45–$300"},
    buy:"$5–$35", profit:"$35–$280", bestPlatform:"Depop",
    tips:["Single-stitch neck and sleeves confirm pre-1990s vintage","Screen Stars, Fruit of the Loom, and Hanes tags add authenticity","Iron-on style printing is not screen print — worth much less"] },

  // B TIER
  { keys:["ralph lauren","polo ralph","polo shirt","polo bear","rl polo"], tier:"B", brand:"Ralph Lauren", category:"Tops",
    desc:"Vintage Ralph Lauren is a reliable and consistent thrift flip. Stadium, Country Club, and Polo Sport sub-brands command the strongest premiums. Larger sizes (XL, XXL) consistently outsell smaller sizes due to streetwear oversized demand.",
    platforms:{"eBay":"$28–$85","Depop":"$32–$95","Poshmark":"$25–$80","Mercari":"$22–$75","Facebook Marketplace":"$18–$55"},
    buy:"$3–$12", profit:"$15–$65", bestPlatform:"Depop",
    tips:["XL and XXL sizes outsell smalls by 2x in price","Polo Bear and Stadium Collection add 50-100% value","Avoid buying faded collars or stretched necks — they won't sell"] },

  { keys:["levi","levis","levi's","501","505","517","vintage levi","vintage jeans","usa levi"], tier:"B", brand:"Levi's", category:"Denim",
    desc:"Vintage Levi's — especially USA-made 501s — are a staple thrift flip with consistent demand year-round. Red Tab, Big E, and Orange Tab variants command the strongest premiums. Accurate measurements are essential.",
    platforms:{"eBay":"$40–$140","Depop":"$45–$155","Poshmark":"$38–$130","Mercari":"$35–$120","Facebook Marketplace":"$28–$90"},
    buy:"$5–$20", profit:"$22–$110", bestPlatform:"Depop",
    tips:["Measure waist and inseam precisely — wrong sizing kills sales","Big E and Orange Tab add $30-50 in value","Made in USA tag commands a 40% premium over imported"] },

  { keys:["north face","nuptse","puffer jacket","north face fleece","north face jacket","northface"], tier:"B", brand:"The North Face", category:"Outerwear",
    desc:"Vintage North Face outerwear consistently performs well in the resale market. Nuptse puffer jackets and fleeces from the 90s and early 2000s are most valuable. Bright colors and older branding command the highest premiums.",
    platforms:{"eBay":"$55–$210","Depop":"$60–$225","Poshmark":"$50–$195","Mercari":"$45–$180","Facebook Marketplace":"$40–$150"},
    buy:"$15–$45", profit:"$28–$155", bestPlatform:"Depop",
    tips:["Half-dome logo (older) vs. modern logo — older commands 30% more","Bright 90s colorways (red, cobalt, forest green) outsell black","Check all zippers and drawcords before buying"] },

  { keys:["nike","air max","air force 1","af1","nike cortez","nike windbreaker","nike acg","vintage nike"], tier:"B", brand:"Nike", category:"Sneakers",
    desc:"Nike has broad and consistent resale appeal across all categories. Retro and vintage pieces perform best. ACG, vintage windbreakers, and heritage silhouettes are particularly strong sellers in the current market.",
    platforms:{"eBay":"$45–$155","Depop":"$50–$165","Poshmark":"$42–$145","Mercari":"$38–$135","StockX":"$55–$170"},
    buy:"$18–$60", profit:"$18–$90", bestPlatform:"eBay",
    tips:["ACG (All Conditions Gear) vintage pieces are especially hot right now","Windbreakers from the 90s fetch $80-200 in good condition","Check midsole for yellowing before buying — it's hard to reverse"] },

  { keys:["adidas","samba","gazelle","stan smith","adidas campus","nmd","ultraboost","adidas originals"], tier:"B", brand:"Adidas", category:"Sneakers",
    desc:"Adidas Originals classics are having a sustained moment. Sambas and Gazelles lead demand driven by fashion editorial coverage. Clean pairs in desirable colorways sell quickly across all platforms.",
    platforms:{"eBay":"$45–$135","Depop":"$50–$145","Poshmark":"$42–$125","Mercari":"$38–$118","StockX":"$55–$150"},
    buy:"$18–$55", profit:"$18–$80", bestPlatform:"Depop",
    tips:["White Sambas and black Sambas are the most liquid colorways","Campus 80s and Gazelles in suede outsell nylon versions","Yellowed midsoles can be whitened with Mr. Clean Magic Eraser"] },

  { keys:["tommy hilfiger","tommy jeans","vintage tommy","tommy hilfiger jacket","tommy spell out"], tier:"B", brand:"Tommy Hilfiger", category:"Tops",
    desc:"Vintage Tommy Hilfiger — especially 90s spell-out and color-block pieces — is a reliable and consistent flip. Jackets, windbreakers, and rugby shirts perform best. The market is steady year-round.",
    platforms:{"eBay":"$30–$110","Depop":"$35–$120","Poshmark":"$28–$100","Mercari":"$25–$95"},
    buy:"$5–$20", profit:"$18–$85", bestPlatform:"Depop",
    tips:["Spell-out logo pieces fetch double plain logo items","Windbreakers and color-block jackets outsell polos","90s era pieces are worth significantly more than 2000s"] },

  // C TIER
  { keys:["lululemon","lululemon leggings","lulu lemon","align","wunder under"], tier:"C", brand:"Lululemon", category:"Athletic",
    desc:"Lululemon has solid secondary market demand, particularly for leggings and sports bras. Align and Wunder Under styles move fastest. The market is active but competitive with many sellers.",
    platforms:{"eBay":"$25–$75","Poshmark":"$28–$80","Depop":"$22–$70","Mercari":"$20–$65"},
    buy:"$8–$25", profit:"$10–$45", bestPlatform:"Poshmark",
    tips:["Align leggings in black and neutral colors sell fastest","No pilling is essential — buyers check photos carefully","Bundle 2-3 pieces together to increase average order value"] },

  { keys:["coach bag","kate spade","michael kors","mk bag","coach purse"], tier:"C", brand:"Contemporary Designer", category:"Accessories",
    desc:"Contemporary designer brands like Coach, Kate Spade, and Michael Kors have a solid but competitive resale market. Condition and style significantly impact sellability. Classic silhouettes perform better than trendy designs.",
    platforms:{"eBay":"$20–$120","Poshmark":"$22–$130","Depop":"$18–$110","Mercari":"$18–$105"},
    buy:"$5–$30", profit:"$10–$80", bestPlatform:"Poshmark",
    tips:{"0":"Classic silhouettes (Tabby, Pillow Tabby) outsell trendy designs","1":"Hardware scratching drops value by 30% — inspect before buying","2":"Dust bag and original packaging add $15-25 to final price"}},

  // D TIER
  { keys:["h&m","zara","shein","forever 21","fashion nova","primark","target clothing","old navy"], tier:"D", brand:"Fast Fashion", category:"Fast Fashion",
    desc:"Fast fashion brands have minimal resale value due to massive supply and low buyer interest. The market is saturated with thousands of identical listings. Your time and shipping costs will likely exceed any profit.",
    platforms:{"eBay":"$3–$9","Poshmark":"$4–$11","Depop":"$3–$8","Mercari":"$3–$7"},
    buy:"$0–$2", profit:"$0–$4", bestPlatform:"Mercari",
    tips:["Only list if you paid essentially nothing — $1 or less","Bundle 5-10 pieces into a lot to justify shipping costs","Exception: viral pieces or limited collabs can be worth listing"] },

  // F TIER
  { keys:["generic","no brand","unbranded","mystery","unknown brand"], tier:"F", brand:"Unknown", category:"General",
    desc:"Unbranded or generic clothing items have virtually no resale market. Without recognizable branding or vintage appeal, buyers have no reason to purchase secondhand over buying new at retail.",
    platforms:{"eBay":"$1–$5","Poshmark":"$2–$6","Depop":"$1–$4","Mercari":"$1–$4"},
    buy:"$0", profit:"$0", bestPlatform:"eBay",
    tips:["Donate rather than list — the tax write-off is worth more","Focus your thrifting energy on branded and vintage items","Exception: unusual or quirky pieces with novelty value"] },
];

const EXPERT_TIPS = {
  S: ["List within 24-48 hours of acquiring — hype fades and early sellers always command the premium price.","Cross-list on StockX AND eBay simultaneously — StockX for authentication trust, eBay for price flexibility.","Professional photographs on a clean white background add perceived value and reduce buyer questions."],
  A: ["Research the last 20 completed eBay sales (filter by 'Sold') before pricing — never guess.","List Thursday evening for best weekend visibility — resale browsers peak Friday–Sunday.","Offer combined shipping if you have multiple pieces — bundles increase average order value significantly."],
  B: ["Steam or lightly iron before photographing — clean presentation adds 15-25% to buyer perception.","Natural window light beats flash photography every time — colors look accurate and textures pop.","Measure and list exact dimensions (chest, length, waist) — listings with measurements sell 40% faster."],
  C: ["Price 10-15% below comparable listings to move inventory quickly — holding costs eat margins.","Refresh your listing every 3-4 days on Depop and Poshmark using their share/relist feature.","Consider donating if it sits unsold for 30 days — carrying cost and time investment may exceed profit."],
  D: ["Only worth listing if your total cost including time is under $2 — margins disappear with fees.","Bundle D-tier items (5-10 pieces as a lot) — buyers will pay for bulk even at low per-item price.","Redirect your thrifting energy to A and S tier categories — same time investment, 10x the return."],
  F: ["Leave it on the rack — your time has real value and this item doesn't justify any of it.","If you already own it, donate for the tax deduction — worth more than any potential sale price.","Use this moment to study what makes items valuable: branding, era, condition, and cultural relevance."],
};

function adjustPrice(price, mult) {
  if (!price || mult === 1.0) return price;
  return price.replace(/\$([\d,]+)/g, (_, n) => "$" + Math.round(parseInt(n.replace(",","")) * mult).toLocaleString());
}

function analyze(input) {
  const q = input.toLowerCase();
  for (const item of ITEMS) {
    if (item.keys.some(k => q.includes(k))) return item;
  }
  // Smart fallback based on keywords
  if (["vintage","90s","80s","70s","retro","deadstock"].some(k => q.includes(k)))
    return { tier:"B", brand:"Vintage", category:"Vintage", desc:"Vintage clothing has solid resale potential when branded and in good condition. Research the specific brand and era to price accurately.", platforms:{"eBay":"$25–$100","Depop":"$28–$110","Poshmark":"$22–$95","Mercari":"$20–$90"}, buy:"$4–$18", profit:"$12–$70", bestPlatform:"Depop", tips:["Research completed sales before pricing","Single-stitch construction confirms pre-1990s era","Photograph all tags and labels — buyers want to verify era"] };
  return { tier:"C", brand:"General", category:"Clothing", desc:"This item has moderate resale potential. Accurate pricing based on current market comparables will be key. Research completed eBay sales before listing to set a competitive price.", platforms:{"eBay":"$12–$55","Poshmark":"$15–$60","Depop":"$12–$52","Mercari":"$10–$48","Facebook Marketplace":"$8–$40"}, buy:"$2–$10", profit:"$6–$35", bestPlatform:"eBay", tips:["Check eBay completed sales to price accurately","Clean and photograph in good lighting","Start price 10% below market to attract first buyers"] };
}

const GS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{background:#f8f6f1;color:#1a1a1a;}
  button{cursor:pointer;font-family:'Inter',sans-serif;}
  textarea,select,input{font-family:'Inter',sans-serif;outline:none;}
  a{text-decoration:none;}
  .card{background:#fff;border:1px solid #e8e3da;border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);}
  .btn-primary{background:#1a1a1a;color:#fff;border:none;border-radius:10px;padding:14px 28px;font-family:'Inter',sans-serif;font-weight:600;font-size:15px;cursor:pointer;transition:all 0.2s;}
  .btn-primary:hover{background:#333;}
  .upload-zone{border:2px dashed #d4cfc4;border-radius:14px;padding:28px 20px;text-align:center;cursor:pointer;transition:all 0.2s;background:#faf8f4;}
  .upload-zone:hover{border-color:#1a1a1a;background:#f0ede6;}
  .platform-row{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-radius:10px;transition:background 0.15s;}
  .platform-row:hover{background:#f8f6f1;}
`;

export default function App() {
  const [page, setPage]         = useState("paywall");
  const [plan, setPlan]         = useState(null);
  const [query, setQuery]       = useState("");
  const [condition, setCond]    = useState("likenew");
  const [imgPreview, setImg]    = useState(null);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [history, setHistory]   = useState([]);
  const [used, setUsed]         = useState(0);
  const fileRef = useRef(null);

  const currentPlan = plan ? PLANS[plan] : null;
  const cond = CONDITIONS[condition] || CONDITIONS.likenew;

  function handleImg(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => { if (e.target && e.target.result) setImg(e.target.result); };
    reader.readAsDataURL(file);
  }

  function rate() {
    const q = query.trim() || "clothing item";
    // No plan = strictly 1 free rating, then hard paywall every time
    if (!plan && used >= 1) { setPage("paywall"); return; }
    // Has plan but hit monthly limit
    if (plan && currentPlan && used >= currentPlan.ratingLimit) { setPage("paywall"); return; }
    setLoading(true);
    const item = analyze(q);
    const mult = cond.mult;
    const prices = Object.entries(item.platforms).map(([name, price]) => ({ name, price: adjustPrice(price, mult) }));
    const r = { id: Date.now(), name: q, imgPreview, condition, tier: item.tier, brand: item.brand, category: item.category, desc: item.desc, prices, buy: adjustPrice(item.buy, mult), profit: adjustPrice(item.profit, mult), bestPlatform: item.bestPlatform, tips: item.tips instanceof Array ? item.tips : Object.values(item.tips) };
    setTimeout(() => { setResult(r); setHistory(h => [r, ...h.slice(0,9)]); setUsed(n => n+1); setQuery(""); setImg(null); setLoading(false); setPage("result"); }, 700);
  }

  // ── PAYWALL ──────────────────────────────────────────────
  if (page === "paywall") return (
    <div style={{background:"#f8f6f1",minHeight:"100vh"}}>
      <style>{GS}</style>
      <div style={{background:"#fff",borderBottom:"1px solid #e8e3da",height:60,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,letterSpacing:"-0.3px"}}>Flip<span style={{color:"#2d6a4f"}}>Rank</span></span>
      </div>
      <div style={{maxWidth:680,margin:"0 auto",padding:"48px 20px 80px"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{display:"inline-block",background:"#e8f5ee",borderRadius:20,padding:"6px 16px",marginBottom:16,fontFamily:"'Inter',sans-serif",fontSize:13,color:"#2d6a4f",fontWeight:600,letterSpacing:"0.02em"}}>AI RESALE INTELLIGENCE</div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(32px,6vw,54px)",fontWeight:700,lineHeight:1.1,letterSpacing:"-0.5px",marginBottom:16}}>Flip Smarter.<br/><span style={{color:"#2d6a4f"}}>Profit More.</span></h1>
          <p style={{fontFamily:"'Inter',sans-serif",color:"#6b6560",fontSize:17,lineHeight:1.7,maxWidth:440,margin:"0 auto"}}>Instant tier ratings, real platform prices, and profit estimates for any clothing item — condition-adjusted and ready to act on.</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {Object.entries(PLANS).map(([key, p]) => (
            <div key={key} className="card" style={{padding:"28px 32px",border:key==="pro"?"2px solid #c2410c":"1px solid #e8e3da",position:"relative"}}>
              {key==="pro" && <div style={{position:"absolute",top:-13,right:24,background:"#c2410c",color:"#fff",borderRadius:20,padding:"4px 14px",fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.05em"}}>MOST POPULAR</div>}
              {key==="elite" && <div style={{position:"absolute",top:-13,right:24,background:"#6d28d9",color:"#fff",borderRadius:20,padding:"4px 14px",fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.05em"}}>BEST VALUE</div>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
                <div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,marginBottom:6}}>{p.name}</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                    <span style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,color:p.color}}>{p.price}</span>
                    <span style={{fontFamily:"'Inter',sans-serif",fontSize:14,color:"#9b9590",fontWeight:400}}>{p.period}</span>
                  </div>
                </div>
                <a href={p.stripe} target="_blank" rel="noopener noreferrer" onClick={()=>{setPlan(key);setTimeout(()=>setPage("home"),300)}}
                  style={{background:p.color,color:"#fff",borderRadius:12,padding:"12px 24px",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:15,display:"inline-block",whiteSpace:"nowrap"}}>
                  Get Started →
                </a>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 24px"}}>
                {p.features.map((f,i) => <div key={i} style={{fontFamily:"'Inter',sans-serif",fontSize:13.5,color:f.startsWith("✅")?"#374151":"#c4bdb5",fontWeight:f.startsWith("✅")?500:400,display:"flex",alignItems:"center",gap:6}}>{f}</div>)}
              </div>
              {key==="basic" && <div style={{marginTop:16,paddingTop:16,borderTop:"1px solid #f0ede6",fontFamily:"'Inter',sans-serif",fontSize:13,color:p.color,fontWeight:600}}>⚡ 25 ratings included per month</div>}
              {key!=="basic" && <div style={{marginTop:16,paddingTop:16,borderTop:"1px solid #f0ede6",fontFamily:"'Inter',sans-serif",fontSize:13,color:p.color,fontWeight:600}}>∞ Unlimited ratings every month</div>}
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:24}}>
          <button onClick={()=>setPage("home")} style={{background:"none",border:"none",fontFamily:"'Inter',sans-serif",fontSize:14,color:"#9b9590",fontWeight:500,cursor:"pointer",textDecoration:"underline"}}>
            Try 1 free rating first — no card needed
          </button>
        </div>
      </div>
    </div>
  );

  // ── RESULT PAGE ──────────────────────────────────────────
  if (page === "result" && result) {
    const T = TIERS[result.tier] || TIERS["C"];
    return (
      <div style={{background:"#f8f6f1",minHeight:"100vh"}}>
        <style>{GS}</style>
        <div style={{background:"#fff",borderBottom:"1px solid #e8e3da",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",position:"sticky",top:0,zIndex:99}}>
          <button onClick={()=>!plan&&used>=1?setPage("paywall"):setPage("home")} style={{background:"none",border:"1px solid #e8e3da",borderRadius:8,padding:"7px 16px",fontFamily:"'Inter',sans-serif",fontWeight:500,fontSize:14,color:"#4b4540"}}>← Back</button>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700}}>Flip<span style={{color:"#2d6a4f"}}>Rank</span></span>
          <button onClick={()=>!plan&&used>=1?setPage("paywall"):setPage("home")} style={{background:"#1a1a1a",border:"none",borderRadius:8,padding:"7px 16px",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:14,color:"#fff"}}>+ New Rating</button>
        </div>

        <div style={{maxWidth:640,margin:"0 auto",padding:"32px 20px 80px"}}>

          {/* Hero tier card */}
          <div style={{background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:20,padding:"32px 28px",marginBottom:20,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,right:0,width:120,height:120,background:T.color,opacity:0.06,borderRadius:"0 0 0 120px"}}/>
            {result.imgPreview && <img src={result.imgPreview} alt="item" style={{width:80,height:80,borderRadius:12,objectFit:"cover",border:"3px solid #fff",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",marginBottom:16,display:"block"}}/>}
            <div style={{display:"flex",alignItems:"flex-start",gap:20}}>
              <div style={{width:80,height:80,borderRadius:16,background:"#fff",border:`3px solid ${T.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Playfair Display',serif",fontSize:44,fontWeight:700,color:T.color,flexShrink:0,boxShadow:`0 4px 16px ${T.color}30`}}>
                {result.tier}
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,color:T.color,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>{T.label} · {T.sub}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#1a1a1a",lineHeight:1.3,marginBottom:6}}>{result.name}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <span style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#6b6560",background:"rgba(0,0,0,0.06)",borderRadius:20,padding:"3px 10px",fontWeight:500}}>{result.brand}</span>
                  <span style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#6b6560",background:"rgba(0,0,0,0.06)",borderRadius:20,padding:"3px 10px",fontWeight:500}}>{result.category}</span>
                  <span style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:T.color,background:T.bg,border:`1px solid ${T.border}`,borderRadius:20,padding:"3px 10px",fontWeight:600}}>{cond.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis */}
          <div className="card" style={{padding:"22px 24px",marginBottom:16}}>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,color:"#9b9590",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Expert Analysis</div>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:15,color:"#374151",lineHeight:1.75,fontWeight:400}}>{result.desc}</p>
            <div style={{marginTop:12,padding:"10px 14px",background:"#f8f6f1",borderRadius:8,fontFamily:"'Inter',sans-serif",fontSize:13,color:"#6b6560",fontWeight:500}}>
              📍 Condition note: {cond.note} — prices adjusted {Math.round((1-cond.mult)*100)}% from mint condition.
            </div>
          </div>

          {/* Profit + Buy — Pro/Elite */}
          {currentPlan && currentPlan.hasProfit ? (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              <div style={{background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:16,padding:"18px 20px"}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,color:"#15803d",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Est. Profit</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:700,color:"#15803d",marginBottom:4}}>{result.profit}</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#4ade80",fontWeight:500}}>after platform fees & shipping</div>
              </div>
              <div style={{background:"#fff7ed",border:"1.5px solid #fdba74",borderRadius:16,padding:"18px 20px"}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,color:"#c2410c",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Max Source Price</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:700,color:"#c2410c",marginBottom:4}}>{result.buy}</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#fb923c",fontWeight:500}}>at thrift / garage sale</div>
              </div>
            </div>
          ) : (
            <div className="card" style={{padding:"18px 22px",marginBottom:16,textAlign:"center",borderStyle:"dashed"}}>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:14,color:"#9b9590",fontWeight:500,marginBottom:10}}>🔒 Profit estimates & fee breakdowns available on Pro & Elite</div>
              <a href={STRIPE.pro} target="_blank" rel="noopener noreferrer" style={{background:"#c2410c",color:"#fff",borderRadius:8,padding:"9px 20px",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:14,display:"inline-block"}}>Upgrade to Pro →</a>
            </div>
          )}

          {/* Best platform callout */}
          {result.bestPlatform && (
            <div style={{background:"#fefce8",border:"1px solid #fde047",borderRadius:14,padding:"14px 18px",marginBottom:16,display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:20}}>⭐</span>
              <div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,color:"#a16207",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>Recommended Platform</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:14,color:"#374151",fontWeight:500}}><strong>{result.bestPlatform}</strong> — best audience and pricing for this specific item</div>
              </div>
            </div>
          )}

          {/* Platform prices */}
          <div className="card" style={{padding:"22px 24px",marginBottom:16}}>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,color:"#9b9590",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14}}>Platform Price Ranges</div>
            <div style={{display:"flex",flexDirection:"column",gap:2}}>
              {result.prices.map((p,i) => {
                const pl = PLATFORMS.find(x => x.name === p.name) || {emoji:"🔗",url:"https://ebay.com",fee:0};
                return currentPlan && currentPlan.hasLinks ? (
                  <a key={i} href={pl.url} target="_blank" rel="noopener noreferrer" className="platform-row">
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:20,width:28,textAlign:"center"}}>{pl.emoji}</span>
                      <div>
                        <div style={{fontFamily:"'Inter',sans-serif",fontSize:14,fontWeight:600,color:"#1a1a1a"}}>{p.name}</div>
                        {currentPlan && currentPlan.hasProfit && <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"#9b9590",fontWeight:400}}>{Math.round(pl.fee*100)}% platform fee · tap to list ↗</div>}
                        {(!currentPlan || !currentPlan.hasProfit) && <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"#9b9590",fontWeight:400}}>tap to open & list ↗</div>}
                      </div>
                    </div>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:T.color}}>{p.price}</div>
                  </a>
                ) : (
                  <div key={i} className="platform-row">
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:20,width:28,textAlign:"center"}}>{pl.emoji}</span>
                      <div style={{fontFamily:"'Inter',sans-serif",fontSize:14,fontWeight:600,color:"#1a1a1a"}}>{p.name}</div>
                    </div>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:T.color}}>{p.price}</div>
                  </div>
                );
              })}
            </div>
            {(!currentPlan || !currentPlan.hasLinks) && (
              <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid #f0ede6",textAlign:"center"}}>
                <a href={STRIPE.pro} target="_blank" rel="noopener noreferrer" style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#c2410c",fontWeight:600}}>🔒 Upgrade to Pro for direct listing links →</a>
              </div>
            )}
          </div>

          {/* Expert Tips — Elite only */}
          {currentPlan && currentPlan.hasTips && result.tips && result.tips.length > 0 && (
            <div className="card" style={{padding:"22px 24px",marginBottom:16,border:"1px solid #ddd6fe"}}>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,color:"#6d28d9",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14}}>⚡ Expert Reseller Insights</div>
              {result.tips.map((tip,i) => (
                <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start",padding:"12px 0",borderBottom:i<result.tips.length-1?"1px solid #f0ede6":"none"}}>
                  <div style={{width:24,height:24,borderRadius:6,background:"#6d28d9",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,color:"#fff",flexShrink:0}}>{i+1}</div>
                  <p style={{fontFamily:"'Inter',sans-serif",fontSize:14,color:"#374151",lineHeight:1.65,fontWeight:400}}>{tip}</p>
                </div>
              ))}
            </div>
          )}

          {currentPlan && !currentPlan.hasTips && (
            <div className="card" style={{padding:"18px 22px",marginBottom:16,textAlign:"center",borderStyle:"dashed"}}>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:14,color:"#9b9590",fontWeight:500,marginBottom:10}}>🔒 Expert reseller insights available on Elite plan</div>
              <a href={STRIPE.elite} target="_blank" rel="noopener noreferrer" style={{background:"#6d28d9",color:"#fff",borderRadius:8,padding:"9px 20px",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:14,display:"inline-block"}}>Upgrade to Elite →</a>
            </div>
          )}

          {/* CTA */}
          <div style={{background:"#1a1a1a",borderRadius:16,padding:"22px 26px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#fff",marginBottom:4}}>Rate another item?</div>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#9b9590",fontWeight:400}}>
                {currentPlan && currentPlan.ratingLimit >= 99999 ? "Unlimited ratings on your plan" : currentPlan ? `${currentPlan.ratingLimit - used} ratings remaining` : used < 1 ? "1 free rating remaining" : "Upgrade to continue rating"}
              </div>
            </div>
            <button onClick={()=>!plan&&used>=1?setPage("paywall"):setPage("home")} style={{background:"#fff",border:"none",borderRadius:10,padding:"11px 20px",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:14,color:"#1a1a1a"}}>Rate Another →</button>
          </div>
        </div>
      </div>
    );
  }

  // ── HOME PAGE ────────────────────────────────────────────
  return (
    <div style={{background:"#f8f6f1",minHeight:"100vh"}}>
      <style>{GS}</style>
      <div style={{background:"#fff",borderBottom:"1px solid #e8e3da",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,background:"linear-gradient(135deg,#2d6a4f,#52b788)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>♻</div>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700}}>Flip<span style={{color:"#2d6a4f"}}>Rank</span></span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {currentPlan && <span style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#9b9590",fontWeight:500}}>{currentPlan.name} · {used}/{currentPlan.ratingLimit >= 99999 ? "∞" : currentPlan.ratingLimit}</span>}
          <button onClick={()=>setPage("paywall")} style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:8,padding:"6px 14px",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:13,color:"#15803d"}}>{currentPlan ? "Upgrade ↑" : "View Plans"}</button>
        </div>
      </div>

      <div style={{maxWidth:620,margin:"0 auto",padding:"40px 20px 60px"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,7vw,52px)",fontWeight:700,lineHeight:1.1,letterSpacing:"-0.3px",marginBottom:10}}>Is It Worth<br/><span style={{color:"#2d6a4f"}}>The Flip?</span></h1>
          <p style={{fontFamily:"'Inter',sans-serif",color:"#6b6560",fontSize:15,lineHeight:1.7,fontWeight:400}}>
            {currentPlan ? `${currentPlan.name} Plan — ${currentPlan.ratingLimit >= 99999 ? "Unlimited ratings" : `${currentPlan.ratingLimit - used} ratings remaining this month`}` : used < 1 ? "1 free rating available — no card needed" : "Subscribe to continue rating items"}
          </p>
        </div>

        {/* Input card */}
        <div className="card" style={{padding:24,marginBottom:24}}>
          {/* Photo upload */}
          {currentPlan && currentPlan.hasPhoto ? (
            <>
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{if(e.target.files&&e.target.files[0])handleImg(e.target.files[0]);}}/>
              {imgPreview ? (
                <div style={{position:"relative",marginBottom:16}}>
                  <img src={imgPreview} alt="preview" style={{width:"100%",height:180,objectFit:"cover",borderRadius:12,display:"block"}}/>
                  <button onClick={()=>setImg(null)} style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,0.7)",border:"none",borderRadius:20,padding:"5px 12px",color:"#fff",fontSize:13,fontWeight:600}}>✕ Remove</button>
                  <div style={{position:"absolute",bottom:10,left:10,background:"#2d6a4f",borderRadius:8,padding:"4px 12px",fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:600,color:"#fff"}}>📸 Photo ready</div>
                </div>
              ) : (
                <div className="upload-zone" onClick={()=>fileRef.current&&fileRef.current.click()} style={{marginBottom:16}}>
                  <div style={{fontSize:28,marginBottom:8}}>📸</div>
                  <div style={{fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:15,color:"#1a1a1a",marginBottom:4}}>Upload a Photo</div>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#9b9590",fontWeight:400}}>Optional — helps with identification and accuracy</div>
                </div>
              )}
            </>
          ) : (
            <div style={{background:"#f8f6f1",border:"1px dashed #d4cfc4",borderRadius:12,padding:"16px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#9b9590",fontWeight:500,marginBottom:3}}>🔒 Photo upload</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#c4bdb5",fontWeight:400}}>Available on Pro & Elite plans</div>
              </div>
              <a href={STRIPE.pro} target="_blank" rel="noopener noreferrer" style={{background:"#c2410c",color:"#fff",borderRadius:8,padding:"7px 14px",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:12,display:"inline-block",whiteSpace:"nowrap"}}>Upgrade</a>
            </div>
          )}

          {/* Condition */}
          <div style={{marginBottom:14}}>
            <label style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:600,color:"#6b6560",letterSpacing:"0.05em",textTransform:"uppercase",display:"block",marginBottom:6}}>Item Condition</label>
            <select value={condition} onChange={e=>setCond(e.target.value)} style={{width:"100%",background:"#f8f6f1",border:"1px solid #e8e3da",borderRadius:10,padding:"11px 14px",fontSize:14,color:"#1a1a1a",fontWeight:500}}>
              {Object.entries(CONDITIONS).map(([val,c]) => <option key={val} value={val}>{c.label} — {c.note}</option>)}
            </select>
          </div>

          {/* Text input */}
          <div style={{marginBottom:14}}>
            <label style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:600,color:"#6b6560",letterSpacing:"0.05em",textTransform:"uppercase",display:"block",marginBottom:6}}>Describe the Item</label>
            <textarea rows={2} value={query} onChange={e=>setQuery(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();rate();}}}
              placeholder={imgPreview?"Add brand or details for better accuracy...":'"Nike Air Jordan 1 Chicago" or "Vintage Patagonia Synchilla Fleece"'}
              style={{background:"#f8f6f1",border:"1px solid #e8e3da",borderRadius:10,color:"#1a1a1a",padding:"12px 14px",fontSize:15,width:"100%",lineHeight:1.6,resize:"none",transition:"border-color 0.15s"}}
              onFocus={e=>e.target.style.borderColor="#1a1a1a"}
              onBlur={e=>e.target.style.borderColor="#e8e3da"}
            />
          </div>

          <button onClick={rate} disabled={loading||(!query.trim()&&!imgPreview)}
            style={{width:"100%",background:loading||(!query.trim()&&!imgPreview)?"#d4cfc4":"#2d6a4f",color:"#fff",border:"none",borderRadius:10,padding:"14px",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:16,transition:"background 0.2s"}}>
            {loading ? "⏳ Analyzing..." : imgPreview ? "📸 Rate With Photo →" : "Rate This Item →"}
          </button>

          {/* Quick examples */}
          <div style={{marginTop:14}}>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:600,color:"#c4bdb5",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Quick Examples</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {["Jordan 1 Chicago","Nike Dunk Low Panda","Vintage Carhartt Detroit","Patagonia Synchilla","Supreme Box Logo","Levi's 501 USA"].map(ex=>(
                <button key={ex} onClick={()=>setQuery(ex)} style={{background:"#f0ede6",border:"1px solid #e8e3da",borderRadius:20,padding:"5px 12px",color:"#6b6560",fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:500,transition:"all 0.15s"}}
                  onMouseOver={e=>{e.currentTarget.style.background="#1a1a1a";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="#1a1a1a";}}
                  onMouseOut={e=>{e.currentTarget.style.background="#f0ede6";e.currentTarget.style.color="#6b6560";e.currentTarget.style.borderColor="#e8e3da";}}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tier guide */}
        <div style={{marginBottom:24}}>
          <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:600,color:"#9b9590",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>Tier Reference</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {Object.entries(TIERS).map(([id,T])=>(
              <div key={id} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,borderRadius:8,background:"#fff",border:`2px solid ${T.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:T.color,flexShrink:0}}>{id}</div>
                <div>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,color:T.color}}>{T.label}</div>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"#9b9590",fontWeight:400,lineHeight:1.3}}>{T.sub.split("—")[1]?T.sub.split("—")[1].trim():""}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:600,color:"#9b9590",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>Previously Rated</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {history.map(item=>{
                const T = TIERS[item.tier]||TIERS["C"];
                return (
                  <button key={item.id} onClick={()=>{setResult(item);setPage("result");}}
                    style={{background:"#fff",border:"1px solid #e8e3da",borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,textAlign:"left",width:"100%",transition:"border-color 0.15s"}}
                    onMouseOver={e=>e.currentTarget.style.borderColor="#1a1a1a"}
                    onMouseOut={e=>e.currentTarget.style.borderColor="#e8e3da"}>
                    {item.imgPreview
                      ? <img src={item.imgPreview} alt="" style={{width:40,height:40,borderRadius:8,objectFit:"cover",flexShrink:0}}/>
                      : <div style={{width:40,height:40,borderRadius:8,background:T.bg,border:`2px solid ${T.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:T.color,flexShrink:0}}>{item.tier}</div>
                    }
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Inter',sans-serif",fontSize:14,fontWeight:600,color:"#1a1a1a",marginBottom:2}}>{item.name}</div>
                      <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:T.color,fontWeight:500}}>{T.label} · {CONDITIONS[item.condition]?CONDITIONS[item.condition].label:""}</div>
                    </div>
                    <span style={{color:"#c4bdb5",fontSize:18}}>›</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
