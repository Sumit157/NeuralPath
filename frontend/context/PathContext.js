import { createContext, useContext, useState, useCallback } from 'react';
import { pathAPI, progressAPI, quizAPI } from '../utils/api';
import { useAuth } from './AuthContext';

const PathContext = createContext(null);

export function PathProvider({ children }) {
  const { updateUser } = useAuth();
  const [pathData,       setPathData]       = useState(null);
  const [selectedTopic,  setSelectedTopic]  = useState(null);
  const [loadingPath,    setLoadingPath]    = useState(false);
  const [revisions,      setRevisions]      = useState([]);
  const [toast,          setToast]          = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPath = useCallback(async () => {
    setLoadingPath(true);
    try {
      const { data } = await pathAPI.generate();
      setPathData(data);
      return data;
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load path', 'error');
    } finally {
      setLoadingPath(false);
    }
  }, []);

  const fetchRevisions = useCallback(async () => {
    try {
      const { data } = await progressAPI.getRevisions();
      setRevisions(data.revisions || []);
    } catch {}
  }, []);

  const completeTopic = async (topicId) => {
    try {
      const { data } = await progressAPI.completeTopic(topicId);
      updateUser({ completedTopics: data.completedTopics, streak: data.streak, badges: data.badges });
      await fetchPath();
      showToast('Topic marked complete! ✓');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  const submitQuiz = async (topicId, answers) => {
    const { data } = await quizAPI.submit({ topicId, answers });
    updateUser({
      completedTopics: data.completedTopics,
      scores:          data.scores,
      badges:          data.badges,
    });
    setRevisions(data.revisions || []);
    await fetchPath();
    return data;
  };

  return (
    <PathContext.Provider value={{
      pathData, selectedTopic, setSelectedTopic,
      loadingPath, revisions,
      toast, showToast,
      fetchPath, fetchRevisions, completeTopic, submitQuiz,
    }}>
      {children}
    </PathContext.Provider>
  );
}

export const usePath = () => {
  const ctx = useContext(PathContext);
  if (!ctx) throw new Error('usePath must be used within PathProvider');
  return ctx;
};
