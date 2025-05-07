import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';  
import { useNavigate } from 'react-router-dom';

function CreateCourse() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    file: null,
    template_id: '', 
    created_at: new Date().toISOString(), 
  });
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState([]); 

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('/templates'); 
        setTemplates(response.data);
      } catch (err) {
        console.error('Ошибка при получении шаблонов:', err);
        setError('Не удалось загрузить шаблоны');
      }
    };

    fetchTemplates();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.type;
      if (fileType !== 'application/pdf' && !fileType.includes('msword') && !fileType.includes('officedocument')) {
        setError('Загрузите файл в формате PDF или Word');
        setForm((prev) => ({ ...prev, file: null })); 
      } else {
        setError('');
        setForm((prev) => ({ ...prev, file }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.file) {
      setError('Пожалуйста, загрузите файл');
      return;
    }
    if (!form.template_id) {
      setError('Пожалуйста, выберите шаблон');
      return;
    }
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('file', form.file);
    formData.append('template_id', form.template_id); 
    formData.append('created_at', form.created_at); 

    try {
      await axios.post('/materials', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Курс успешно загружен!');
      navigate('/dashboard');
    } catch (err) {
      alert('Ошибка при загрузке курса');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Создание курса</h2>
      <input
        type="text"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Название курса"
        required
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Описание курса"
        required
      />
      <input
        type="number"
        name="price"
        value={form.price}
        onChange={handleChange}
        placeholder="Цена курса"
        required
      />

      <select
        name="template_id"
        value={form.template_id}
        onChange={handleChange}
        required
      >
        <option value="">Выберите шаблон</option>
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>
      <input type="file" name="file" onChange={handleFileChange} required />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Загрузить курс</button>
    </form>
  );
}

export default CreateCourse;
