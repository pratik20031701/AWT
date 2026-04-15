from django.urls import path
from . import views

urlpatterns = [
    path('', views.student_list, name='student_list'),
    path('register/', views.register, name='register'),
    path('delete/<int:pk>/', views.delete_student, name='delete_student'),
]
