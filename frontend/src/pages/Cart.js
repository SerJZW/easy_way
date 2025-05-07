import React, { useState } from 'react';

function Cart() {
  const [cart, setCart] = useState([]);

  const handleRemove = (courseId) => {
    setCart(cart.filter(item => item.id !== courseId));
  };

  const handleCheckout = () => {
    alert('Процесс оформления заказа');
  };

  return (
    <div>
      <h2>Корзина</h2>
      {cart.length === 0 ? <p>Корзина пуста</p> : (
        <div>
          <ul>
            {cart.map(course => (
              <li key={course.id}>
                {course.title} — {course.price}₽
                <button onClick={() => handleRemove(course.id)}>Удалить</button>
              </li>
            ))}
          </ul>
          <button onClick={handleCheckout}>Оформить заказ</button>
        </div>
      )}
    </div>
  );
}

export default Cart;
