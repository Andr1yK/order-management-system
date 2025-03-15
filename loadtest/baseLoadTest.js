import http from 'k6/http';
import { sleep, check } from 'k6';

// Параметри тесту
export const options = {
  stages: [
    { duration: '30s', target: 30 },   // Розігрів: 5 користувачів за 30 секунд
    { duration: '1m', target: 100 },   // Збільшення до 10 користувачів за 1 хвилину
    { duration: '2m', target: 100 },   // Підтримка 10 користувачів протягом 2 хвилин
    { duration: '30s', target: 0 },   // Зниження до 0 користувачів
  ],
};

// Функція для автентифікації та отримання токена
function authenticate() {
  const payload = JSON.stringify({
    email: 'admin@example.com',
    password: 'password123',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const loginRes = http.post('http://localhost:3000/api/auth/login', payload, params);

  const success = check(loginRes, {
    'login successful': (r) => r.status === 200,
    'has token': (r) => JSON.parse(r.body).data.token !== undefined,
  });

  if (!success) {
    console.log(`Помилка логіна: ${loginRes.status} ${loginRes.body}`);
    return null;
  }

  return JSON.parse(loginRes.body).data.token;
}

// Функція для отримання списку користувачів
function getUsers(token) {
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  return http.get('http://localhost:3000/api/users?page=1&limit=10', params);
}

// Функція для створення випадкового замовлення
function createRandomOrder(token) {
  const payload = JSON.stringify({
    user_id: 2, // Використовуємо існуючого користувача
    status: 'pending',
    items: [
      {
        product_name: `Тестовий продукт ${Math.floor(Math.random() * 100)}`,
        quantity: Math.floor(Math.random() * 5) + 1,
        price: (Math.random() * 100 + 10).toFixed(2),
      },
      {
        product_name: `Тестовий продукт ${Math.floor(Math.random() * 100)}`,
        quantity: Math.floor(Math.random() * 3) + 1,
        price: (Math.random() * 50 + 5).toFixed(2),
      },
    ],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  return http.post('http://localhost:3000/api/orders', payload, params);
}

// Функція для отримання списку замовлень
function getOrders(token) {
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  return http.get('http://localhost:3000/api/orders?page=1&limit=10', params);
}

// Основна функція тесту
export default function() {
  // Логінимось для отримання токена
  const token = authenticate();
  if (!token) {
    sleep(1);
    return;
  }

  // Симулюємо паузу користувача
  sleep(Math.random() * 1 + 0.5);

  // Отримуємо список користувачів
  const usersRes = getUsers(token);
  check(usersRes, {
    'users loaded': (r) => r.status === 200,
  });

  sleep(Math.random() * 0.5 + 0.2);

  // Створюємо нове замовлення
  const orderRes = createRandomOrder(token);
  check(orderRes, {
    'order created': (r) => r.status === 201,
  });

  sleep(Math.random() * 0.5 + 0.2);

  // Отримуємо список замовлень
  const ordersRes = getOrders(token);
  check(ordersRes, {
    'orders loaded': (r) => r.status === 200,
  });

  // Фінальна пауза перед завершенням ітерації
  sleep(Math.random() * 1 + 0.5);
}
