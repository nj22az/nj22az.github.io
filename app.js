const { useState, useEffect } = React;

function Header() {
  return React.createElement('header', null,
    React.createElement('h1', null, 'Nils Johansson'),
    React.createElement('nav', null, [
      React.createElement('a', { href: '#', key: 'home' }, 'Home')
    ])
  );
}

function Footer() {
  return React.createElement('footer', null, '\u00a9 ' + new Date().getFullYear() + ' Nils Johansson');
}

function PostCard({ post, onOpen }) {
  return React.createElement('div', { className: 'post-card', onClick: () => onOpen(post) }, [
    React.createElement('h2', { key: 'title' }, post.title),
    React.createElement('div', { className: 'meta', key: 'meta' }, post.date),
    React.createElement('p', { key: 'excerpt' }, post.excerpt)
  ]);
}

function PostList({ posts, onOpen }) {
  return React.createElement('div', null,
    posts.map((post, index) =>
      React.createElement(PostCard, { post, onOpen, key: index })
    )
  );
}

function PostView({ post, onBack }) {
  return React.createElement('div', { className: 'post-content' }, [
    React.createElement('button', { className: 'button', onClick: onBack, key: 'back' }, '\u2190 Back'),
    React.createElement('h1', { key: 'title' }, post.title),
    React.createElement('div', { key: 'content', dangerouslySetInnerHTML: { __html: post.content } })
  ]);
}

function App() {
  const [posts, setPosts] = useState([]);
  const [activePost, setActivePost] = useState(null);

  useEffect(() => {
    fetch('posts/posts.json')
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

  function openPost(post) {
    fetch('posts/' + post.filename)
      .then(res => res.text())
      .then(md => {
        const html = marked.parse(md);
        setActivePost({ ...post, content: html });
      });
  }

  return React.createElement('div', { className: 'container' }, [
    React.createElement(Header, { key: 'header' }),
    activePost ?
      React.createElement(PostView, { post: activePost, onBack: () => setActivePost(null), key: 'postview' }) :
      React.createElement(PostList, { posts, onOpen: openPost, key: 'postlist' }),
    React.createElement(Footer, { key: 'footer' })
  ]);
}

ReactDOM.render(React.createElement(App
                                   ), document.getElementById('root'));
(function() {
  var script = document.createElement('script');
  script.src = 'main.js';
  script.type = 'text/javascript';
  document.body.appendChild(script);
})();
