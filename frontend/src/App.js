import { Route, Routes } from 'react-router-dom';
import { PublicRoute, PrivateRoute } from './routes/guards/routesGuards.jsx';
import { Toaster } from 'react-hot-toast';
import Login from './pages//Login/Login.jsx';
import SignUp from './pages//SignUp/SignUp.jsx';
import Home from './pages//Home/Home.jsx';
import PeriodDataForm from './pages/PeriodDataForm/PeriodDataForm.jsx';
import Header from './components/Header/Header.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import HeaderNotLogged from './components/Header/HeaderNotLogged.jsx';
import CalendarPage from './pages/CalendarPage/CalendarPage.jsx';
import StatsPage from './pages/Stats/Stats.jsx';
import Menu from './components/Menu/Menu.jsx';
import ArchivePage from './pages/Archive/ArchivePage.jsx';

function App() {
  return (
    <div>
      <main>
        <Routes>
          {/* Rutas públicas */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <HeaderNotLogged />
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <>
                <HeaderNotLogged /> <SignUp />
              </>
            }
          />

          {/* Rutas privadas */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <ErrorBoundary>
                  <Header />
                  <div className="main-content">
                    <Home />
                  </div>
                  <Menu />
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#fff',
                        color: '#333',
                        borderRadius: '8px',
                        padding: '12px'
                      }
                    }}
                  />
                </ErrorBoundary>
              </PrivateRoute>
            }
          />
          <Route
            path="/first-questions"
            element={
              <PrivateRoute>
                <div className="main-content">
                  <PeriodDataForm />
                </div>
              </PrivateRoute>
            }
          />

          <Route
            path="/calendar"
            element={
              <PrivateRoute>
                <Header />
                <div className="main-content">
                  <CalendarPage />
                </div>
                <Menu />
              </PrivateRoute>
            }
          />

          <Route
            path="/stats"
            element={
              <PrivateRoute>
                <Header />
                <div className="main-content">
                  <StatsPage />
                </div>
                <Menu />
              </PrivateRoute>
            }
          />

          <Route
            path="/archive"
            element={
              <PrivateRoute>
                <Header />
                <div className="main-content">
                  <ArchivePage />
                </div>
                <Menu />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
