import './App.css';
import MarkdownEditor from './components/editor/MarkdownEditor';
import BoardList from './components/board/BoardList';
import BoardView from './components/board/BoardView';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<BoardList />} />
            <Route path="/write" element={<MarkdownEditor />} />
            <Route path="/board/:boardId" element={<BoardView />} />
            <Route path="/edit/:boardId" element={<MarkdownEditor />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
