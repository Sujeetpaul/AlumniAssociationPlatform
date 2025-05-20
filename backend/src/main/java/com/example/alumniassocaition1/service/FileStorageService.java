package com.example.alumniassocaition1.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import com.example.alumniassocaition1.exception.FileStorageException; // Import custom exceptions
import com.example.alumniassocaition1.exception.MyFileNotFoundException;

import java.nio.file.Path;
import java.util.stream.Stream;

public interface FileStorageService {
    /**
     * Initializes the storage. Creates the upload directory if it doesn't exist.
     */
    void init() throws FileStorageException; // Keep throws clause

    /**
     * Stores a file in the local file system.
     * @param file The MultipartFile to store.
     * @return The unique filename under which the file is stored.
     */
    String storeFile(MultipartFile file) throws FileStorageException; // Keep throws clause

    /**
     * Loads all stored filenames.
     * @return A stream of paths to the stored files.
     */
    Stream<Path> loadAll() throws FileStorageException; // Keep throws clause

    /**
     * Loads a file by its filename.
     * @param filename The name of the file to load.
     * @return The path to the loaded file.
     */
    Path load(String filename);

    /**
     * Loads a file as a Spring Resource.
     * @param filename The name of the file to load.
     * @return The file as a Resource.
     */
    Resource loadFileAsResource(String filename) throws MyFileNotFoundException; // Keep throws clause

    /**
     * Deletes a file from the local file system.
     * @param filename The name of the file to delete.
     */
    void deleteFile(String filename); // Deletion failure might not need explicit throws if only logged
}
