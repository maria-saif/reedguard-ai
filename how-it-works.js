
const stepData = {
  1: {
    title: "إدخال البيانات",
    tag: "Input",
    text: "نجمع صورًا ميدانية (درون/كاميرات) مع مؤشرات بيئية (رطوبة/رياح/تربة) لتحويل الواقع إلى بيانات قابلة للقياس.",
    chips: ["Drone Images","Field Photos","Humidity","Wind","Soil"]
  },
  2: {
    title: "تحليل بالرؤية الحاسوبية",
    tag: "Vision",
    text: "تحليل الصور لاكتشاف الروغ بصريًا (Segmentation/Detection) وتحويله إلى خريطة كثافة.",
    chips: ["Detection","Segmentation","Density Map","Zones"]
  },
  3: {
    title: "تنبؤ بالانتشار",
    tag: "Predict",
    text: "دمج الكثافة مع المؤشرات البيئية للتنبؤ باتجاه وسرعة الانتشار.",
    chips: ["Spread Model","Humidity","Wind","Risk Score"]
  },
  4: {
    title: "محرك توصيات ذكي",
    tag: "Decision",
    text: "اختيار القرار الأفضل: مراقبة، حصاد للاستفادة، أو تدخل مبكر حسب العتبات.",
    chips: ["Thresholds","Policies","Early Action"]
  },
  5: {
    title: "نتائج قابلة للتطبيق",
    tag: "Output",
    text: "عرض النتائج بخطوات تنفيذ واضحة وإمكانية تصدير تقرير.",
    chips: ["Dashboard","Actions","Export"]
  }
};

const pipeline = document.getElementById("pipeline");
if (pipeline){
  const steps = Array.from(pipeline.querySelectorAll(".pstep"));
  const detailTitle = document.getElementById("detailTitle");
  const detailTag = document.getElementById("detailTag");
  const detailText = document.getElementById("detailText");
  const detailChips = document.getElementById("detailChips");

  function setStep(n){
    steps.forEach(s=> s.classList.toggle("active", s.dataset.step === String(n)));
    const d = stepData[n];
    if(!d) return;

    detailTitle.textContent = d.title;
    detailTag.textContent = d.tag;
    detailText.textContent = d.text;

    detailChips.innerHTML = "";
    d.chips.forEach(c=>{
      const el = document.createElement("span");
      el.className = "chip";
      el.textContent = c;
      detailChips.appendChild(el);
    });
  }

  steps.forEach(s=>{
    s.addEventListener("click", ()=> setStep(Number(s.dataset.step)));
  });

  setStep(1);
}

const runAI = document.getElementById("runAI");
const fill = document.getElementById("fill");
const stages = Array.from(document.querySelectorAll(".stage"));

const outDensity = document.getElementById("outDensity");
const outRisk = document.getElementById("outRisk");
const outDecision = document.getElementById("outDecision");
const outConf = document.getElementById("outConf");
const outWhy = document.getElementById("outWhy");

function clamp(n,a,b){ return Math.max(a, Math.min(b,n)); }

function densityLabel(v){
  if(v >= 70) return "عالية";
  if(v >= 40) return "متوسطة";
  return "منخفضة";
}
function riskLabel(v){
  if(v >= 90) return "مرتفع";
  if(v >= 55) return "متوسط";
  return "منخفض";
}
function pickDecision(d,r,sensitive){
  if(r === "مرتفع" || (sensitive && r === "متوسط")) return "تدخل مبكر";
  if(d !== "منخفضة" && r !== "منخفض") return "حصاد";
  return "مراقبة";
}

function resetStages(){
  stages.forEach(st=>{
    st.classList.remove("done","live");
    const sp = st.querySelector("span:last-child");
    if(sp) sp.textContent = "جاهز";
  });
  if(fill) fill.style.width = "0%";
}

async function runDemo(){
  if(!runAI) return;
  runAI.disabled = true;
  runAI.textContent = "جاري التحليل...";
  resetStages();

  const densVal = clamp(Math.round(35 + Math.random()*55), 0, 100);
  const sensitive = Math.random() > 0.65;
  const envBoost = Math.round(Math.random()*25);
  const score = clamp(densVal + envBoost + (sensitive ? 10 : 0), 0, 120);

  const densL = densityLabel(densVal);
  const riskL = riskLabel(score);
  const decision = pickDecision(densL, riskL, sensitive);
  const conf = clamp(Math.round(76 + Math.random()*16), 72, 95);

  const timeline = [
    {k:"vision", text:"تحليل الصور"},
    {k:"features", text:"استخراج المؤشرات"},
    {k:"predict", text:"تنبؤ الانتشار"},
    {k:"recommend", text:"توليد القرار"}
  ];

  let progress = 0;

  for(const t of timeline){
    stages.forEach(st=> st.classList.toggle("live", st.dataset.k === t.k));
    const stEl = stages.find(x=> x.dataset.k === t.k);
    if(stEl){
      const sp = stEl.querySelector("span:last-child");
      if(sp) sp.textContent = t.text;
    }
    progress += 25;
    if(fill) fill.style.width = progress + "%";
    await new Promise(r=> setTimeout(r, 550));

    if(stEl){
      stEl.classList.remove("live");
      stEl.classList.add("done");
      const sp = stEl.querySelector("span:last-child");
      if(sp) sp.textContent = "مكتمل";
    }
  }

  if(outDensity) outDensity.textContent = `${densL} (${densVal}/100)`;
  if(outRisk) outRisk.textContent = `${riskL} (${score}/120)`;
  if(outDecision) outDecision.textContent = decision + (sensitive ? " • موقع حساس" : "");
  if(outConf) outConf.textContent = conf + "%";
  if(outWhy){
    outWhy.textContent =
      `الكثافة ${densL} مع تأثير بيئي (+${envBoost})` +
      (sensitive ? " والموقع حساس." : ".") +
      ` القرار النهائي: ${decision}.`;
  }

  runAI.disabled = false;
  runAI.textContent = "شغّل تحليل";
}

if(runAI){
  runAI.addEventListener("click", runDemo);
}

const imgInput = document.getElementById("imgInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const aiBox = document.getElementById("aiBox");
const aiFill = document.getElementById("aiFill");
const canvas = document.getElementById("cvCanvas");
let ctx = canvas ? canvas.getContext("2d",{willReadFrequently:true}) : null;
let loadedImage = null;

function drawImage(img){
  if(!ctx || !canvas) return;
  const maxW = 1000;
  const scale = Math.min(1, maxW / img.width);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  ctx.drawImage(img,0,0,canvas.width,canvas.height);
}

function analyzeImage(){
  if(!loadedImage || !ctx) return alert("ارفعي صورة أولًا");
  aiBox.style.display = "block";
  aiFill.style.width = "0%";
  setTimeout(()=> aiFill.style.width = "50%", 300);

  setTimeout(()=>{
    const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = imgData.data;
    let greenish = 0, samples = 0;

    for(let i=0;i<d.length;i+=24){
      const r=d[i], g=d[i+1], b=d[i+2];
      if(g > r+15 && g > b+15) greenish++;
      samples++;
    }
    const ratio = greenish / samples;
    const densL = ratio>0.6?"عالية":ratio>0.35?"متوسطة":"منخفضة";
    const risk = clamp(Math.round(ratio*100 + Math.random()*20),0,100);
    const decision = risk>70?"تدخل مبكر":densL!=="منخفضة"?"حصاد":"مراقبة";

    aiFill.style.width = "100%";
    setTimeout(()=> aiBox.style.display="none",300);

    if(outDensity) outDensity.textContent = `${densL} (${Math.round(ratio*100)}%)`;
    if(outRisk) outRisk.textContent = risk>70?"مرتفع":risk>40?"متوسط":"منخفض";
    if(outDecision) outDecision.textContent = decision;
    if(outConf) outConf.textContent = clamp(75+Math.random()*15,75,95).toFixed(0)+"%";
    if(outWhy){
      outWhy.textContent =
        "تم تحليل الصورة داخل المتصفح وتقدير الغطاء النباتي بصريًا ثم تحويله إلى كثافة ومؤشر خطر.";
    }
  },600);
}

if(imgInput){
  imgInput.addEventListener("change", e=>{
    const f = e.target.files[0];
    if(!f) return;
    const img = new Image();
    img.onload = ()=>{
      loadedImage = img;
      drawImage(img);
    };
    img.src = URL.createObjectURL(f);
  });
}
if(analyzeBtn) analyzeBtn.addEventListener("click", analyzeImage);
if(clearBtn){
  clearBtn.addEventListener("click", ()=>{
    loadedImage=null;
    if(ctx) ctx.clearRect(0,0,canvas.width,canvas.height);
    if(aiBox) aiBox.style.display="none";
  });
}
