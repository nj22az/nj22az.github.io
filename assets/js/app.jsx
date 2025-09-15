const App = () => {
  const [posts] = React.useState(window.__POSTS__ || []);
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>{window.__SITE_TITLE__}</h1>
      </header>
      <main className="posts-list">
        {posts.map(post => (
          <article key={post.url} className="post-card">
            <h2><a href={post.url}>{post.title}</a></h2>
            <p className="post-date">{post.date}</p>
          </article>
        ))}
      </main>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
