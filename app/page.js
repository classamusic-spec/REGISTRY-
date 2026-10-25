import Registry from "../components/Registry";
import { Balloon, Cloud } from "../components/Art";
import { categories, items } from "../lib/registry";
import { config } from "../lib/config";

export default function Home() {
  return (
    <main className="sheet">
      <header className="hero">
        <div className="hero-branch" aria-hidden="true">
          <img src="/art/branch.webp" alt="" width="1100" height="1037" fetchPriority="high" />
          <img className="branch-bees" src="/art/bees-branch.webp" alt="" width="505" height="476" />
        </div>
        <img className="hero-bees" src="/art/bees.webp" alt="" width="520" height="480" />
        <Balloon className="hero-balloon" />
        <img className="hero-pot" src="/art/honey-pot.webp" alt="" width="480" height="567" />

        <p className="eyebrow">a sweet</p>
        <h1 className="title">little hunny</h1>
        <p className="subtitle">is on the way</p>

        <p className="honoring">baby shower registry for mom-to-be</p>
        <p className="mom">{config.momName}</p>

        <div className="date-row" aria-label={`${config.dateLabel} at ${config.timeLabel}`}>
          <span className="rule">{config.month}</span>
          <span className="day">{config.day}</span>
          <span className="rule">{config.timeLabel.replace(" ", "")}</span>
        </div>
      </header>

      <section className="welcome" aria-labelledby="welcome-title">
        <h2 id="welcome-title">💙 Our Family Is Growing! 💙</h2>
        <p>
          Our hearts are growing, and our family is getting a little bigger! We’re so excited to welcome our second baby
          boy and feel incredibly blessed to experience this beautiful chapter of our lives again. 👶🏻🩵
        </p>
        <p>
          Thank you for being part of our journey and for showering our growing family with so much love. Whether you’re
          here to help us prepare for our newest little blessing or simply celebrate with us, we’re so grateful to have
          you in our lives.
        </p>
        <p>
          Thank you for helping us welcome our sweet baby boy into the world. We can’t wait for you to meet him! 🍼💙
        </p>
        <p className="signoff">
          With love,
          <span>Our Growing Family 🤍</span>
        </p>
      </section>

      <section className="intro">
        <ol className="steps">
          <li>
            <b>1</b>
            <span>Pick a gift you love below.</span>
          </li>
          <li>
            <b>2</b>
            <span>
              Tap <strong>Purchase</strong> — it opens on Walmart in a new tab.
            </span>
          </li>
          <li>
            <b>3</b>
            <span>
              Come back and tap <strong>Yes, I bought it</strong> so it greys out and nobody doubles up.
            </span>
          </li>
        </ol>
        {config.invitationUrl ? (
          <a className="cloud" href={config.invitationUrl} target="_blank" rel="noopener">
            <Cloud />
            <span>
              the
              <br />
              invitation
              <small>click here</small>
            </span>
          </a>
        ) : null}
      </section>

      <Registry items={items} categories={categories} />

      <footer className="footer">
        <img className="footer-pot" src="/art/honey-pot.webp" alt="" width="480" height="567" loading="lazy" />
        <div className="script">thank you</div>
        <p>for helping us welcome our little hunny 🍯</p>
      </footer>
    </main>
  );
}
