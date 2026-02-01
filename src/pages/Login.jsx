import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
} from '@mui/material'
import { Google as GoogleIcon } from '@mui/icons-material'

function Login() {
  const { user, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
    } catch (error) {
      console.error('Failed to login:', error)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ textAlign: 'center', py: 6, px: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight={700}
            color="primary"
          >
            TimeTracker
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Track your time, achieve your goals
          </Typography>

          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={handleGoogleLogin}
            startIcon={<GoogleIcon />}
            sx={{
              py: 1.5,
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Login
