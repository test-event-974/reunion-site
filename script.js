const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTOY9WmGasf0YMnB1w3mpQYNIAF-C3b1j46K7JxckTOlapK4RdAZtofozukxHeSAl2IqwWzCxaxSqtg/pub?output=tsv";

const FALLBACK_CONTENT = {
  bienvenue: {
    hero_kicker: "Bienvenue",
    hero_title: "Site de présentation",
    hero_subtitle: "Le contenu n'a pas pu être chargé en ligne. Voici une version locale minimale.",
    article_title: "Accès temporaire",
    article_p1: "La source distante est momentanément indisponible.",
    article_p2: "Réessayez dans quelques minutes pour retrouver tout le contenu.",
    date_label: "Mise à jour",
    date_value: "En attente",
    languages_label: "Langues",
    language_1: "Français",
    branches_label: "Rubriques",
    branch_1: "Accueil"
  },
  oeuvre: {
    hero_kicker: "L'œuvre du Royaume",
    hero_title: "Contenu temporaire",
    hero_subtitle: "Les données complètes seront visibles dès que la connexion au tableur sera rétablie.",
    languages_label: "Langues",
    languages_text: "Cette section sera automatiquement remplie.",
    section_1_title: "Vue d'ensemble",
    section_1_text_1: "Le contenu est chargé depuis une source distante.",
    section_2_title: "À retenir",
    highlight_1: "Connexion requise pour le contenu complet"
  },
  histoire: {
    hero_kicker: "Notre histoire",
    hero_title: "Contenu temporaire",
    hero_subtitle: "Les périodes historiques apparaîtront automatiquement après chargement des données.",
    reading_label: "Lectures recommandées",
    reading_1: "Réessayez ultérieurement."
  },
  pays: {
    hero_kicker: "Le pays et ses habitants",
    hero_title: "Contenu temporaire",
    hero_subtitle: "Le détail géographique, culturel et climatique est indisponible pour le moment.",
    geo_title: "Géographie",
    geo_text_1: "Les informations sont synchronisées depuis un tableur en ligne.",
    climate_title: "Climat",
    climate_text_1: "Réessayez dans quelques instants."
  },
  interesse: {
    hero_kicker: "Es-tu intéressé(e) ?",
    hero_title: "Contact",
    hero_subtitle: "Les informations détaillées n'ont pas pu être chargées.",
    intro_p1: "Vous pouvez toutefois revenir plus tard pour consulter la version complète.",
    cta_title: "Restez connecté",
    cta_text: "Réessayez lorsque la connexion à la source de données sera disponible."
  }
};

function parseTSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split("\t");
    if (cols.length >= 3) {
      rows.push({
        page: (cols[0] || "").trim(),
        field: (cols[1] || "").trim(),
        value: cols.slice(2).join("\t").trim()
      });
    }
  }

  return rows;
}

function mapPageData(rows, pageKey) {
  const data = {};
  rows
    .filter(r => r.page === pageKey)
    .forEach(r => {
      data[r.field] = r.value;
    });
  return data;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "";
}

function setImage(id, url, fallback = "") {
  const img = document.getElementById(id);
  if (!img) return;

  if (!url) {
    img.style.display = "none";
    return;
  }

  img.style.display = "block";
  img.src = url;
  img.onerror = function () {
    if (fallback) {
      this.src = fallback;
    } else {
      this.style.display = "none";
    }
  };
}

function setBackgroundImage(id, url) {
  const el = document.getElementById(id);
  if (!el) return;

  if (!url) {
    el.style.backgroundImage = "none";
    return;
  }

  el.style.backgroundImage = `url("${url}")`;
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showStatusBanner(message) {
  let banner = document.getElementById("status_banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "status_banner";
    banner.className = "status-banner";
    document.body.appendChild(banner);
  }
  banner.textContent = message;
}

function renderList(containerId, values, itemClass = "") {
  const el = document.getElementById(containerId);
  if (!el) return;

  const filtered = values.filter(Boolean);
  if (!filtered.length) {
    el.innerHTML = "";
    return;
  }

  el.innerHTML = filtered
    .map(v => `<div class="${itemClass}">${escapeHtml(v)}</div>`)
    .join("");
}

function renderGallery(containerId, items) {
  const grid = document.getElementById(containerId);
  if (!grid) return;

  const filtered = items.filter(item => item.url);
  if (!filtered.length) {
    grid.innerHTML = "";
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <figure class="gallery-item">
      <img loading="lazy" src="${escapeHtml(item.url)}" alt="${escapeHtml(item.caption || "")}" onerror="this.style.display='none'">
      ${item.caption ? `<figcaption class="gallery-caption">${escapeHtml(item.caption)}</figcaption>` : ""}
    </figure>
  `).join("");
}

function renderStats(items) {
  const container = document.getElementById("stats_grid");
  if (!container) return;

  const filtered = items.filter(item => item.label || item.value);
  if (!filtered.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="stat-card">
      <div class="stat-value">${escapeHtml(item.value || "")}</div>
      <div class="stat-label">${escapeHtml(item.label || "")}</div>
    </div>
  `).join("");
}

function renderHistoryPeriods(data) {
  const container = document.getElementById("history_periods");
  if (!container) return;

  const blocks = [];

  for (let i = 1; i <= 5; i++) {
    const title = data[`period_${i}_title`];
    const text = data[`period_${i}_text`];

    const images = [];
    for (let j = 1; j <= 4; j++) {
      const url = data[`period_${i}_image_${j}`];
      const caption = data[`period_${i}_caption_${j}`];
      if (url) images.push({ url, caption });
    }

    if (!title && !text && !images.length) continue;

    blocks.push(`
      <section class="content-section">
        ${title ? `<h2>${escapeHtml(title)}</h2>` : ""}
        ${text ? `<p>${escapeHtml(text)}</p>` : ""}
        <div class="gallery-grid">
          ${images.map(item => `
            <figure class="gallery-item">
              <img loading="lazy" src="${escapeHtml(item.url)}" alt="${escapeHtml(item.caption || "")}" onerror="this.style.display='none'">
              ${item.caption ? `<figcaption class="gallery-caption">${escapeHtml(item.caption)}</figcaption>` : ""}
            </figure>
          `).join("")}
        </div>
      </section>
    `);
  }

  container.innerHTML = blocks.join("");
}

function renderPageCommon(data) {
  setText("hero_kicker", data.hero_kicker);
  setText("hero_title", data.hero_title || data.page_title || data.article_title);
  setText("hero_subtitle", data.hero_subtitle);
  setImage("hero_image", data.hero_image);
  setImage("logo_image", data.logo_image);
  setBackgroundImage("hero", data.hero_image);
}

function renderBienvenue(data) {
  renderPageCommon(data);

  setText("article_title", data.article_title);
  setText("article_p1", data.article_p1);
  setText("article_p2", data.article_p2);
  setText("article_p3", data.article_p3);
  setText("article_p4", data.article_p4);
  setText("article_p5", data.article_p5);

  setText("date_label", data.date_label);
  setText("date_value", data.date_value);
  setText("languages_label", data.languages_label);
  setText("branches_label", data.branches_label);

  renderList("languages_list", [
    data.language_1, data.language_2, data.language_3, data.language_4,
    data.language_5, data.language_6, data.language_7, data.language_8
  ], "pill");

  renderList("branches_list", [
    data.branch_1, data.branch_2, data.branch_3, data.branch_4, data.branch_5,
    data.branch_6, data.branch_7, data.branch_8, data.branch_9, data.branch_10,
    data.branch_11, data.branch_12
  ], "pill");

  const carouselItems = [];
  for (let i = 1; i <= 5; i++) {
    carouselItems.push({
      url: data[`carousel_${i}_image`],
      caption: data[`carousel_${i}_caption`]
    });
  }
  renderGallery("carousel_grid", carouselItems);
}

function renderOeuvre(data) {
  renderPageCommon(data);

  setText("languages_label", data.languages_label);
  setText("languages_text", data.languages_text);
  setText("section_1_title", data.section_1_title);
  setText("section_1_text_1", data.section_1_text_1);
  setText("section_1_text_2", data.section_1_text_2);
  setText("section_2_title", data.section_2_title);
  setText("section_2_text_1", data.section_2_text_1);
  setText("section_2_text_2", data.section_2_text_2);
  setText("highlight_1", data.highlight_1);
  setText("highlight_2", data.highlight_2);
  setText("gallery_title", data.gallery_title);
  setText("closing_1", data.closing_1);
  setText("closing_2", data.closing_2);
  setText("signature", data.signature);

  renderStats([
    { value: data.stat_1_value, label: data.stat_1_label },
    { value: data.stat_2_value, label: data.stat_2_label },
    { value: data.stat_3_value, label: data.stat_3_label },
    { value: data.stat_4_value, label: data.stat_4_label }
  ]);

  renderList("languages_list", [
    data.lang_1, data.lang_2, data.lang_3, data.lang_4,
    data.lang_5, data.lang_6, data.lang_7, data.lang_8
  ], "pill");

  const galleryItems = [];
  for (let i = 1; i <= 12; i++) {
    galleryItems.push({
      url: data[`gallery_${i}_image`] || data[`image_${i}_url`],
      caption: data[`gallery_${i}_caption`] || data[`image_${i}_caption`]
    });
  }
  renderGallery("gallery_grid", galleryItems);
}

function renderHistoire(data) {
  renderPageCommon(data);
  renderHistoryPeriods(data);

  setText("reading_label", data.reading_label);
  renderList("reading_list", [
    data.reading_1, data.reading_2, data.reading_3, data.reading_4, data.reading_5
  ], "reading-item");
}

function renderPays(data) {
  renderPageCommon(data);

  setText("geo_title", data.geo_title);
  setText("geo_text_1", data.geo_text_1);
  setText("geo_text_2", data.geo_text_2);

  setText("fauna_title", data.fauna_title);
  setText("fauna_text", data.fauna_text);
  setText("fauna_fact_label", data.fauna_fact_label);
  setText("fauna_fact_text", data.fauna_fact_text);

  setText("climate_title", data.climate_title);
  setText("climate_text_1", data.climate_text_1);
  setText("climate_text_2", data.climate_text_2);
  setText("climate_text_3", data.climate_text_3);

  setText("people_title", data.people_title);
  setText("people_text_1", data.people_text_1);
  setText("people_text_2", data.people_text_2);

  setText("cuisine_title", data.cuisine_title);
  setText("cuisine_text_1", data.cuisine_text_1);
  setText("cuisine_text_2", data.cuisine_text_2);

  renderList("climate_regions", [
    data.climate_region_1, data.climate_region_2, data.climate_region_3, data.climate_region_4
  ], "pill");

  renderGallery("geo_gallery", [1, 2, 3, 4, 5].map(i => ({
    url: data[`geo_image_${i}`],
    caption: data[`geo_caption_${i}`]
  })));

  renderGallery("fauna_gallery", [1, 2, 3, 4, 5].map(i => ({
    url: data[`fauna_image_${i}`],
    caption: data[`fauna_caption_${i}`]
  })));

  renderGallery("cuisine_gallery", [1, 2, 3, 4, 5, 6, 7, 8].map(i => ({
    url: data[`cuisine_image_${i}`],
    caption: data[`cuisine_caption_${i}`]
  })));
}

function renderInteresse(data) {
  renderPageCommon(data);

  setText("intro_p1", data.intro_p1);
  setText("intro_p2", data.intro_p2);
  setText("cta_title", data.cta_title);
  setText("cta_text", data.cta_text);
  setText("info_1_title", data.info_1_title);
  setText("info_1_text", data.info_1_text);
  setText("info_2_title", data.info_2_title);
  setText("info_2_text", data.info_2_text);

  const ctaBtn = document.getElementById("cta_button");
  if (ctaBtn) {
    ctaBtn.textContent = data.cta_button_label || "";
    ctaBtn.href = data.cta_button_url || "#";
    ctaBtn.target = "_blank";
    ctaBtn.rel = "noopener noreferrer";
    if (!data.cta_button_label) ctaBtn.style.display = "none";
  }
}

function renderByPageKey(pageKey, data) {
  switch (pageKey) {
    case "bienvenue":
      renderBienvenue(data);
      break;
    case "oeuvre":
      renderOeuvre(data);
      break;
    case "histoire":
      renderHistoire(data);
      break;
    case "pays":
      renderPays(data);
      break;
    case "interesse":
      renderInteresse(data);
      break;
    default:
      console.warn("Page inconnue :", pageKey);
  }
}

async function loadPage(pageKey) {
  try {
    const response = await fetch(SHEET_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    const rows = parseTSV(text);
    const data = mapPageData(rows, pageKey);

    if (!Object.keys(data).length) {
      throw new Error(`Aucune donnée trouvée pour ${pageKey}`);
    }

    renderByPageKey(pageKey, data);
  } catch (error) {
    console.error("Erreur de chargement :", error);
    const fallback = FALLBACK_CONTENT[pageKey] || {};
    renderByPageKey(pageKey, fallback);
    showStatusBanner("⚠️ Contenu chargé en mode secours (hors ligne). Réessayez plus tard pour la version complète.");
  }
}
