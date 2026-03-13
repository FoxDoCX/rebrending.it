const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document
  .querySelectorAll(".hero, .proof-strip, .section, .cta-section")
  .forEach((element) => revealObserver.observe(element));

const outputs = document.querySelectorAll("[data-output-for]");
const calculator = document.getElementById("price-calculator");
const totalPrice = document.getElementById("total-price");
const breakdown = document.getElementById("breakdown");
const currencyFormatter = new Intl.NumberFormat("ru-RU");

const tierConfig = {
  base: {
    label: "Базовый формат поддержки",
    fee: 18000,
    workplaceRate: 650,
    serverRate: 2600,
  },
  business: {
    label: "Бизнес-поддержка",
    fee: 32000,
    workplaceRate: 820,
    serverRate: 3400,
  },
  critical: {
    label: "Критичный SLA",
    fee: 52000,
    workplaceRate: 980,
    serverRate: 4700,
  },
};

function formatRubles(value) {
  return `${currencyFormatter.format(Math.round(value))} ₽`;
}

function updateRangeOutputs() {
  outputs.forEach((output) => {
    const input = document.getElementById(output.dataset.outputFor);
    if (input) {
      output.textContent = input.value;
    }
  });
}

function createBreakdownRow(label, value) {
  const row = document.createElement("div");
  row.className = "breakdown-row";

  const title = document.createElement("span");
  title.textContent = label;

  const amount = document.createElement("span");
  amount.textContent = formatRubles(value);

  row.append(title, amount);
  return row;
}

function updateCalculator() {
  if (!calculator || !totalPrice || !breakdown) {
    return;
  }

  updateRangeOutputs();

  const workplaces = Number(document.getElementById("workplaces").value);
  const servers = Number(document.getElementById("servers").value);
  const oneCHours = Number(document.getElementById("one-c-hours").value);
  const onsiteVisits = Number(document.getElementById("onsite-visits").value);
  const supportTier = tierConfig[document.getElementById("support-tier").value];
  const security = document.getElementById("security").checked;
  const afterHours = document.getElementById("after-hours").checked;

  const lineItems = [
    { label: supportTier.label, value: supportTier.fee },
    { label: `Рабочие места: ${workplaces}`, value: workplaces * supportTier.workplaceRate },
    { label: `Серверы: ${servers}`, value: servers * supportTier.serverRate },
  ];

  if (oneCHours > 0) {
    lineItems.push({
      label: `Поддержка 1С: ${oneCHours} ч.`,
      value: oneCHours * 2300,
    });
  }

  if (onsiteVisits > 0) {
    lineItems.push({
      label: `Выезды инженера: ${onsiteVisits}`,
      value: onsiteVisits * 4500,
    });
  }

  if (security) {
    lineItems.push({
      label: "ИТ-безопасность и резервные копии",
      value: 18000,
    });
  }

  let total = lineItems.reduce((sum, item) => sum + item.value, 0);

  if (afterHours) {
    const surcharge = total * 0.5;
    lineItems.push({
      label: "Надбавка за поддержку вне рабочего времени",
      value: surcharge,
    });
    total += surcharge;
  }

  totalPrice.textContent = formatRubles(total);
  breakdown.replaceChildren(...lineItems.map((item) => createBreakdownRow(item.label, item.value)));
}

if (calculator) {
  calculator.addEventListener("input", updateCalculator);
  calculator.addEventListener("change", updateCalculator);
  updateCalculator();
}
