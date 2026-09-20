/* =============================================
 * c-algorithms/01_patient_records.c
 * C Learning Module 1: Structs, Pointers, & File I/O
 * =============================================
 * CONCEPTS TAUGHT:
 *   1. Custom C Structures (struct Patient)
 *   2. Pointers & Direct Memory Addresses
 *   3. Binary File Operations (fopen, fwrite, fread, fclose)
 * =============================================
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Define Patient structure
typedef struct {
    int id;
    char mrn[20];
    char name[50];
    int age;
    char blood_group[5];
} Patient;

// Function to print a patient record using a pointer (efficient memory access)
void print_patient(const Patient *p) {
    printf("----------------------------------------\n");
    printf("Patient ID   : %d\n", p->id);
    printf("MRN          : %s\n", p->mrn);
    printf("Name         : %s\n", p->name);
    printf("Age          : %d years\n", p->age);
    printf("Blood Group  : %s\n", p->blood_group);
    printf("----------------------------------------\n");
}

int main(void) {
    printf("========================================\n");
    printf("  PulseCare HMS — C Patient Record Engine\n");
    printf("========================================\n\n");

    // Create 3 sample patient records in memory
    Patient patients[3] = {
        {1, "PAT-2026-001", "Eleanor Vance", 34, "A+"},
        {2, "PAT-2026-002", "Marcus Brody", 52, "O+"},
        {3, "PAT-2026-003", "Clara Oswald", 29, "B-"}
    };

    const char *filename = "patients.dat";

    // Step 1: Write records to binary file (File I/O)
    FILE *file = fopen(filename, "wb");
    if (!file) {
        perror("Failed to open file for writing");
        return 1;
    }

    size_t written = fwrite(patients, sizeof(Patient), 3, file);
    fclose(file);
    printf("[SUCCESS] Wrote %u patient records to binary file '%s'.\n\n", (unsigned int)written, filename);

    // Step 2: Read records back from binary file into fresh memory
    Patient loaded_patients[3];
    file = fopen(filename, "rb");
    if (!file) {
        perror("Failed to open file for reading");
        return 1;
    }

    size_t read_count = fread(loaded_patients, sizeof(Patient), 3, file);
    fclose(file);
    printf("[SUCCESS] Read %u patient records back from binary file:\n\n", (unsigned int)read_count);

    // Step 3: Print records using pointer iteration
    for (int i = 0; i < 3; i++) {
        print_patient(&loaded_patients[i]);
    }

    return 0;
}
