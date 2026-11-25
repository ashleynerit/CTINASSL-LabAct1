import agnifiedImage from "../assets/agnified.jpg";
import wattpadIcon from "../assets/wattpad_icon.png";

export default function About() {
  return (
    <main className="section about-page">
      <p className="accent">OUR STORY</p>
      <h1>About Garden of Daffodils</h1>
      <p>
        Welcome to the official Garden of Daffodils store, a dedicated
        space for readers and supporters to discover the
        author's published works and exclusive merchandise.
      </p>
      <hr className="about-divider" />

      <section className="about-author">
        <img
          className="about-author-image"
          src={agnifiedImage}
          alt="Illustration of Agnified"
        />
        <div>
          <h2>Meet the Author</h2>
          <p> <br />
            Agnified starts her writing journey with Alfanta Series back
            in 2021 where she found solace in the characters. She was just
            16 back then but her creative mind has since evolved. 
            
            <br /> <br />She is the creative mind behind the stories
            and collections featured in this shop. This is where
            readers can discover more about the author and
            celebrate the world behind the books.
          </p>
        </div>
      </section>

      <hr className="about-divider" />
      <section className="about-social">
        <h2>Connect with Agnified</h2>
        <p>
          Join the official Facebook page of Agnified Readers for updates,
          community news, and conversations with fellow readers.
        </p>
        <div className="about-social-list">
          <a
            className="about-social-card"
            href="https://www.facebook.com/profile.php?id=100068893703870"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3 className="about-social-title">
              <svg
                className="about-social-icon facebook-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M24 12a12 12 0 1 0-13.875 11.85v-8.38H7.08V12h3.045V9.356c0-3.006 1.791-4.668 4.532-4.668 1.312 0 2.686.234 2.686.234v2.953h-1.513c-1.49 0-1.955.925-1.955 1.874V12h3.328l-.532 3.47h-2.796v8.38A12 12 0 0 0 24 12" />
              </svg>
              Facebook
            </h3>
            <p>Agnified Stories</p>
          </a>
          <a
            className="about-social-card"
            href="https://www.instagram.com/agnified_stories"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3 className="about-social-title">
              <svg
                className="about-social-icon instagram-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#feda75" />
                    <stop offset="50%" stopColor="#d62976" />
                    <stop offset="100%" stopColor="#4f5bd5" />
                  </linearGradient>
                </defs>
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                  fill="none"
                  stroke="url(#instagram-gradient)"
                  strokeWidth="2"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  fill="none"
                  stroke="url(#instagram-gradient)"
                  strokeWidth="2"
                />
                <circle cx="17.5" cy="6.5" r="1.25" fill="#d62976" />
              </svg>
              Instagram
            </h3>
            <p>agnified_stories</p>
          </a>
          <a
            className="about-social-card"
            href="https://www.wattpad.com/user/agnified"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3 className="about-social-title">
              <img
                className="about-social-icon wattpad-icon"
                src={wattpadIcon}
                alt=""
              />
              Wattpad
            </h3>
            <p>agnified</p>
          </a>
          <a className="about-social-card" href="mailto:agnostywp@gmail.com">
            <h3 className="about-social-title">
              <svg
                className="about-social-icon email-icon"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="m4 7 8 6 8-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Email
            </h3>
            <p>agnostywp@gmail.com</p>
          </a>
        </div>
      </section>
    </main>
  );
}