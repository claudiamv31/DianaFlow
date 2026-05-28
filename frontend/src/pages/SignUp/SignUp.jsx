import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SignUp.css';
import image from '../../assets/register-img.png';
import Input from '../../components/Input';
import Button from '../../components/Button';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5039/api/users/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Name: name,
          LastName: lastName,
          Email: email,
          Password: password
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'There was an error saving the profile');
      }

      navigate('/first-questions'); // O /login
    } catch (error) {
      console.error('Error in sign in:', error.message);
    }
  };

  return (
    <div className="App">
      <div className="left-div">
        <img src={image} alt="Shine" />
      </div>
      <div className="right-div">
        <h1>Create Account</h1>
        <form onSubmit={handleSignIn}>
          <Input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="primary">
            Sign Up
          </Button>
        </form>
        <div className="signup-text">
          Already have an account? <Link to={'/login'}>Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
