# Usar una imagen base de Java
FROM eclipse-temurin:17-jdk-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el JAR en el contenedor
COPY target/mi-aplicacion.jar app.jar

# Exponer el puerto que tu aplicación usa (por defecto Spring Boot usa 8080)
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]

