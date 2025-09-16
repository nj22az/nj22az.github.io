const { useState, useEffect } = React;

function Navigation({ currentPage, onChange }) {
  const pages = ['home','blog','downloads','about'];
  return React.createElement('nav', { className: 'nav-bar' },
    pages.map(page =>
      React.createElement('a', {
        key: page,
        href: '#',
        className: currentPage === page ? 'active' : '',
        onClick: (e) => { e.preventDefault(); onChange(page); }
      }, page.charAt(0).toUpperCase() + page.slice(1))
    )
  );
}

function Hero() {
  return React.createElement('section', { className: 'hero' },
    React.createElement('h1', null, 'Welcome to My Site'),
    React.createElement('p', null, 'Exploring engineering, culture, and more.')
  );
}

function PostCard({ post, onOpen }) {
  return React.createElement('div', {
    className: 'post-card',
    onClick: () => onOpen(post)
  }, [
    React.createElement('h3', { key: 'title' }, post.title),
    React.createElement('p', { key: 'meta', className: 'meta' }, post.date),
    React.createElement('p', { key: 'excerpt', className: 'excerpt' }, post.excerpt)
  ]);
}

function PostList({ posts, onOpen }) {
  return React.createElement('div', { className: 'container' },
    posts.map((post, index) =>
      React.createElement(PostCard, { post, onOpen, key: index })
    )
  );
}

function PostView({ post, onBack }) {
  const [content, setContent] = useState('');
  useEffect(() => {
    fetch('posts/' + post.filename)
      .then(res => res.text())
      .then(text => {
        const html = marked.parse(text);
        setContent(html);
      });
  }, [post]);
  return React.createElement('div', { className: 'post-content' }, [
    React.createElement('button', { key: 'back', className: 'button', onClick: onBack }, '\u2190 Back'),
    React.createElement('h2', { key: 'title' }, post.title),
    React.createElement('div', { key: 'content', className: 'content', dangerouslySetInnerHTML: { __html: content } })
  ]);
}

function DownloadCard({ item }) {
  return React.createElement('div', { className: 'download-card' }, [
    React.createElement('h3', { key: 'title' }, item.title),
    React.createElement('p', { key: 'desc' }, item.description),
    React.createElement('div', { key: 'meta', className: 'download-meta' }, [
      React.createElement('span', { key: 'type' }, item.file_type),
      React.createElement('span', { key: 'size' }, item.file_size),
      React.createElement('span', { key: 'count' }, item.download_count + ' downloads')
    ])
  ]);
}

function DownloadsPage({ downloads }) {
  return React.createElement('div', { className: 'download-grid' },
    downloads.map((item, index) =>
      React.createElement(DownloadCard, { item, key: index })
    )
  );
}

function AboutPage() {
  return React.createElement('div', { className: 'about-content' }, [
    React.createElement('h2', { key: 'heading' }, 'About Me'),
    React.createElement('p', { key: 'p1' }, 'I am Nils Johansson, a marine engineer turned field service engineer.'),
    React.createElement('p', { key: 'p2' }, 'My journey has taken me across oceans and continents. This site shares my passions and experiences.'),
    React.createElement('p', { key: 'p3' }, 'Thank you for visiting!')
  ]);
}

function HomePage({ posts, onOpen }) {
  return React.createElement('div', null, [
    React.createElement(Hero, { key: 'hero' }),
    React.createElement(PostList, { key: 'posts', posts: posts, onOpen })
  ]);
}

function BlogPage({ posts, onOpen }) {
  return React.createElement('div', null,
    React.createElement('h2', null, 'Blog'),
    React.createElement(PostList, { posts: posts, onOpen })
  );
}

function App() {
  const [page, setPage] = useState('home');
  const [posts, setPosts] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);

  useEffect(() => {
    fetch('posts/posts.json')
      .then(res => res.json())
      .then(setPosts);
    fetch('downloads.json')
      .then(res => res.json())
      .then(setDownloads)
      .catch(() => setDownloads([]));
  }, []);

  const handleOpenPost = (post) => {
    setCurrentPost(post);
  };

  const handleBack = () => {
    setCurrentPost(null);
  };

  let content;
  if (currentPost) {
    content = React.createElement(PostView, { post: currentPost, onBack: handleBack });
  } else {
    if (page === 'home') {
      content = React.createElement(HomePage, { posts, onOpen: handleOpenPost });
    } else if (page === 'blog') {
      content = React.createElement(BlogPage, { posts, onOpen: handleOpenPost });
    } else if (page === 'downloads') {
      content = React.createElement(DownloadsPage, { downloads });
    } else if (page === 'about') {
      content = React.createElement(AboutPage);
    }
  }

  return React.createElement('div', null, [
    React.createElement(Navigation, { key: 'nav', currentPage: page, onChange: setPage }),
    content,
    React.createElement('footer', { key: 'footer' }, '\u00A9 ' + new Date().getFullYear() + ' Nils Johansson')
  ]);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(App)
);
