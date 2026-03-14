from rest_framework.test import APITestCase
from rest_framework import status
from apps.authentication.models import User


class AuthTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email='user@test.com',
            password='test1234',
            name='Test User',
            role='user'
        )

    def get_token(self):
        res = self.client.post('/auth/login/', {'email': 'user@test.com', 'password': 'test1234'})
        return res.data

    def test_register(self):
        res = self.client.post('/auth/register/', {
            'name': 'New User', 'email': 'new@test.com',
            'phone': '1234567890', 'password': 'test1234', 'password2': 'test1234'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_login(self):
        res = self.client.post('/auth/login/', {'email': 'user@test.com', 'password': 'test1234'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)

    def test_login_wrong_password(self):
        res = self.client.post('/auth/login/', {'email': 'user@test.com', 'password': 'wrong'})
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_profile(self):
        tokens = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        res = self.client.get('/auth/profile/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_profile_unauthenticated(self):
        res = self.client.get('/auth/profile/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout(self):
        tokens = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        res = self.client.post('/auth/logout/', {'refresh': tokens['refresh']})
        self.assertEqual(res.status_code, status.HTTP_200_OK)