package com.example.alumniassocaition1.service;

import com.example.alumniassocaition1.exception.FileStorageException; // Import custom exceptions
import com.example.alumniassocaition1.exception.MyFileNotFoundException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
// Correct Resource import
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.util.stream.Stream;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageServiceImpl(@Value("${file.upload-dir:./uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @Override
    @PostConstruct
    public void init() throws FileStorageException {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            // Wrap the original exception
            throw new FileStorageException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file) throws FileStorageException {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";

        try {
            if (originalFileName.contains("..")) {
                throw new FileStorageException("Sorry! Filename contains invalid path sequence " + originalFileName);
            }

            if (originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }

            String uniqueFileName = UUID.randomUUID() + fileExtension;
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            return uniqueFileName;
        } catch (IOException ex) {
            // Wrap the original exception
            throw new FileStorageException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
        // Removed redundant catch block for FileStorageException
    }

    @Override
    public Stream<Path> loadAll() throws FileStorageException {
        try {
            return Files.walk(this.fileStorageLocation, 1)
                    .filter(path -> !path.equals(this.fileStorageLocation))
                    .map(this.fileStorageLocation::relativize);
        } catch (IOException e) {
            // Wrap the original exception
            throw new FileStorageException("Failed to read stored files", e);
        }
    }

    @Override
    public Path load(String filename) {
        return fileStorageLocation.resolve(filename);
    }

    @Override
    public Resource loadFileAsResource(String filename) throws MyFileNotFoundException {
        try {
            Path filePath = load(filename).normalize();
            // Use Spring's UrlResource
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) { // Check both exists and isReadable
                return resource;
            } else {
                throw new MyFileNotFoundException("Could not read file: " + filename);
            }
        } catch (MalformedURLException ex) {
            throw new MyFileNotFoundException("File not found " + filename, ex);
        }
    }

    @Override
    public void deleteFile(String filename) {
        try {
            Path filePath = load(filename).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            // Log this, but don't necessarily throw a fatal error if file deletion fails
            System.err.println("Could not delete file: " + filename + " due to " + ex.getMessage());
            // Optionally rethrow if deletion failure is critical:
            // throw new FileStorageException("Could not delete file " + filename, ex);
        }
    }
}

