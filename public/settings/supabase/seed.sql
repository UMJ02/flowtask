insert into public.departments (code, name) values
('mercadeo', 'Mercadeo'),
('logistica', 'Logística'),
('recursos_humanos', 'Recursos Humanos'),
('operaciones', 'Operaciones'),
('finanzas', 'Finanzas'),
('ti', 'TI'),
('inco', 'INCO')
on conflict (code) do update set name = excluded.name;
