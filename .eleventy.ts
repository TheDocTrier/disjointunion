import { JSDOM } from "jsdom";
import { DateTime } from "luxon";
const is_prod = process.env.NODE_ENV === "production";

const config = function (eleventyConfig: any) {
  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.ignores.add("./node_modules/");
  eleventyConfig.addWatchTarget("./src/style.css");

  eleventyConfig.addPassthroughCopy("./src/static");
  if (!is_prod) eleventyConfig.addPassthroughCopy("./static");
  eleventyConfig.addPassthroughCopy("./src/_redirects");

  // generate static urls
  eleventyConfig.addFilter("static", function (r: string) {
    if (is_prod) {
      return `https://static.disjointunion.link${r}`;
    } else {
      return `/static${r}`;
    }
  });

  // collection for sitemap
  eleventyConfig.addCollection("allByUrl", function (collectionApi) {
    return collectionApi.getAll().sort(function (a, b) {
      if (a.url < b.url) return -1;
      if (a.url > b.url) return +1;
      return 0;
    });
  });

  // select list of attributes from a list of objects
  eleventyConfig.addFilter("map", (l: unknown[], attr: string) =>
    l.map((x) => x[attr])
  );

  // rel=me helper
  eleventyConfig.addShortcode(
    "rel",
    (rel: string, name: string, href: string) =>
      `<a rel="${rel}" href="${href}">${name}</a>`
  );

  // image with thumbnail helper
  eleventyConfig.addShortcode(
    "imgT",
    (src: string, alt: string, full: string) =>
      `<a title="${alt}" href="${full}"><img alt="${alt}" src="${src}"/></a>`
  );

  // my account helper
  eleventyConfig.addGlobalData("my", {
    ao3: "https://archiveofourown.org/users/TheDocTrier",
    artstation: "https://www.artstation.com/thedoctrier",
    discord: "https://discord.com",
    deviantart: "https://www.deviantart.com/thedoctrier",
    e621: "https://e621.net/users/678526",
    furaffinity: "https://www.furaffinity.net/user/thedoctrier/",
    github: "https://github.com/TheDocTrier",
    goodreads: "https://www.goodreads.com/user/show/117546295-michael-bradley",
    internetarchive: "https://archive.org/details/@tankobot",
    itch: "https://thedoctrier.itch.io/",
    kofi: "https://ko-fi.com/thedoctrier",
    liberapay: "https://liberapay.com/TheDocTrier/",
    patreon: "https://www.patreon.com/thedoctrier",
    picarto: "https://picarto.tv/TheDocTrier",
    reddit: "https://www.reddit.com/user/TheDocTrier",
    stackexchange: "https://stackexchange.com/users/19080546/thedoctrier",
    telegram: "https://t.me/TheDocTrier",
    twitch: "https://www.twitch.tv/doctrier",
    twitter: "https://twitter.com/TheDocTrier",
    wikifur: "https://en.wikifur.com/wiki/User:TheDocTrier",
    wikipedia: "https://en.wikipedia.org/wiki/User:TheDocTrier",
  });

  // Table of Contents
  eleventyConfig.addPlugin(require("eleventy-plugin-toc"), { ul: true });

  // typical date formatting
  const fmtDate = (date: Date, fmt = "yyyy-MM-dd, t (ZZZZ)") =>
    DateTime.fromJSDate(date).setZone("America/Los_Angeles").toFormat(fmt);
  eleventyConfig.addFilter("fmtDate", fmtDate);

  // licenses
  eleventyConfig.addGlobalData("cc", {
    name: "CC BY-SA 4.0",
    href: "https://creativecommons.org/licenses/by-sa/4.0/",
  });

  // markdown
  let mdLib = require("markdown-it");
  let md = mdLib({ html: true })
    .use(require("markdown-it-anchor"), {
      slugify: eleventyConfig.getFilter("slugify"),
    })
    .use(require("markdown-it-emoji"), {
      defs: {
        ...require("markdown-it-emoji/lib/data/full.json"),
        disjoint_union: "⊔",
      },
      shortcuts: {},
    });
  md.renderer.rules.emoji = (token, idx) =>
    `<span class="emoji" title="${token[idx].markup}">${token[idx].content}</span>`;

  eleventyConfig.setLibrary("md", md);
  eleventyConfig.addFilter("markdown", (x) => md.renderInline(x));

  // code adapted from sardinev's external-links plugin (MIT license)
  eleventyConfig.addTransform(
    "external-links",
    (content: string, outputPath: string) => {
      if (outputPath && outputPath.endsWith(".html")) {
        try {
          const dom = new JSDOM(content);
          const { document } = dom.window;
          const links = document.querySelectorAll<HTMLAnchorElement>("a");

          if (links.length > 0) {
            links.forEach((link) => {
              if (/^(https?\:)?\/\//i.test(link.href)) {
                link.classList.add("external-link");
                link.target = "_blank";
                link.rel += " noreferrer noopener";
              }
            });
          } else {
            return content;
          }

          return dom.serialize();
        } catch (e) {
          console.error(e);
        }
      }
      return content;
    }
  );

  return {
    dir: {
      input: "src",
    },
    htmlTemplateEngine: "njk",
  };
};

export = config;
