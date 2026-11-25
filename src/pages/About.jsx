export default function About() {
  return (
    <main className="section about-page">
      <p className="accent">OUR STORY</p>
      <h1>About Agnified</h1>
      <p>
        Welcome to the official Agnified store, a dedicated
        space for readers and supporters to discover the
        author's published works and exclusive merchandise.
      </p>

      <h2>Meet the Author</h2>
      <p>
        Agnified is the creative mind behind the stories
        and collections featured in this shop. This is where
        readers can discover more about the author and
        celebrate the world behind the books.
      </p>

      <section className="about-social">
        <h2>Connect with Agnified</h2>
        <p>
          Join the official Facebook page of Agnified Readers for updates,
          community news, and conversations with fellow readers.
        </p>
        <div className="about-social-list">
          <div className="about-social-card">
            <h3>Facebook</h3>
            <p>Official page: Agnified Readers</p>
          </div>
          <div className="about-social-card">
            <h3>Instagram</h3>
            <p>Details coming soon.</p>
          </div>
          <div className="about-social-card">
            <h3>Email</h3>
            <p>Contact details coming soon.</p>
          </div>
        </div>
      </section>
    </main>
  );
}