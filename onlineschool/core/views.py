# core/views.py (Optimized for Phase 1)

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import Course, Enrollment
from .serializers import UserSerializer, CourseSerializer, EnrollmentSerializer, MyTokenObtainPairSerializer
from .permissions import IsInstructorOrAdmin
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import action
from django.http import JsonResponse


User = get_user_model()


# def my_courses(request):
#     enrolled_courses = Enrollment.objects.filter(student=request.user).select_related('course')
#     courses = [enrollment.course for enrollment in enrolled_courses]
#     return JsonResponse({'courses': [course.title for course in courses]})

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny] # Allow any user to register

    def create(self, request, *args, **kwargs):
      serializer = self.get_serializer(data=request.data)
      serializer.is_valid(raise_exception=True)
      user = serializer.save()
      refresh = RefreshToken.for_user(user)
      return Response({
          'refresh': str(refresh),
          'access': str(refresh.access_token),
      }, status=status.HTTP_201_CREATED)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    
    def create(self, request, *args, **kwargs):
      print("Authorization header:", request.META.get('HTTP_AUTHORIZATION'))
      print("User:", request.user, "Authenticated:", request.user.is_authenticated)
      serializer = self.get_serializer(data=request.data)
      serializer.is_valid(raise_exception=True)
      self.perform_create(serializer)
      headers = self.get_success_headers(serializer.data)
      return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer

    def create(self, request, *args, **kwargs):
        # Ensure only students can enroll
        if request.user.role != 'student':
            return Response({'error': 'Only students can enroll in courses.'}, status=status.HTTP_403_FORBIDDEN)

        # Check if student is already enrolled
        course_id = request.data.get('course')
        if Enrollment.objects.filter(student=request.user, course_id=course_id).exists():
            return Response({'error': 'You are already enrolled in this course.'}, status=status.HTTP_400_BAD_REQUEST)

        return super().create(request, *args, **kwargs)

    # Get courses the student is enrolled in
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_courses(self, request):
        enrolled_courses = Enrollment.objects.filter(student=request.user).select_related('course')
        courses_data = [{'id': enrollment.course.id, 'title': enrollment.course.title} for enrollment in enrolled_courses]
        return Response(courses_data)