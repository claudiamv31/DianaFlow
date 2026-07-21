import { Route, Routes } from 'react-router-dom';
import { PublicRoute, PrivateRoute } from './routes/guards/routesGuards.jsx';
import { Toaster } from 'react-hot-toast';
import Login from './pages//Login/Login.jsx';
import SignUp from './pages//SignUp/SignUp.jsx';
import Home from './pages//Home/Home.jsx';
import PeriodDataForm from './pages/PeriodDataForm/PeriodDataForm.jsx';
import PeriodSetup from './pages/PeriodSetup/PeriodSetup.jsx';
import Header from './components/Header/Header.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import CalendarPage from './pages/CalendarPage/CalendarPage.jsx';
import StatsPage from './pages/Stats/Stats.jsx';
import Menu from './components/Menu/Menu.jsx';
import ArchivePage from './pages/Archive/ArchivePage.jsx';
import Settings from './pages/Settings/Settings.jsx';

const mainContentClassName = 'mb-20 mt-[60px] pb-24';

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
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <>
                <SignUp />
              </>
            }
          />

          {/* Period Setup Wizard Route */}
          <Route
            path="/period-setup"
            element={
              <PrivateRoute>
                <PeriodSetup />
              </PrivateRoute>
            }
          />

          {/* Rutas privadas */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <ErrorBoundary>
                  <Header />
                  <div className={mainContentClassName}>
                    <Home />
                  </div>
                  <Menu />
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: 'rgb(var(--color-surface-container-high))',
                        color: 'rgb(var(--color-on-surface))',
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
                <div className={mainContentClassName}>
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
                <div className={mainContentClassName}>
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
                <div className={mainContentClassName}>
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
                <div className={mainContentClassName}>
                  <ArchivePage />
                </div>
                <Menu />
              </PrivateRoute>
            }
          />

          <Route
            path="/configuration"
            element={
              <PrivateRoute>
                <Header />
                <div className={mainContentClassName}>
                  <Settings />
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
