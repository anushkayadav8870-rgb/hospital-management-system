/* =============================================
 * c-algorithms/02_patient_search_sort.c
 * C Learning Module 2: Searching & Sorting Algorithms
 * =============================================
 * CONCEPTS TAUGHT:
 *   1. Linear Search - O(n)
 *   2. Binary Search - O(log n)
 *   3. Bubble Sort Algorithm - O(n^2)
 *   4. Quicksort Algorithm using qsort() - O(n log n)
 * =============================================
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    int id;
    char name[50];
    int triage_urgency; // 1 = Low, 5 = Critical Emergency
} PatientRecord;

// Comparator function for qsort() - sorts descending by urgency
int compare_urgency(const void *a, const void *b) {
    const PatientRecord *p1 = (const PatientRecord *)a;
    const PatientRecord *p2 = (const PatientRecord *)b;
    return p2->triage_urgency - p1->triage_urgency;
}

// Linear Search by Patient ID
int linear_search(PatientRecord arr[], int n, int target_id) {
    for (int i = 0; i < n; i++) {
        if (arr[i].id == target_id) {
            return i; // Index found
        }
    }
    return -1; // Not found
}

int main(void) {
    printf("========================================\n");
    printf("  PulseCare HMS — Search & Sort Engine\n");
    printf("========================================\n\n");

    PatientRecord queue[5] = {
        {104, "Sophia Loren", 2},
        {101, "Eleanor Vance", 4},
        {105, "Arthur Pendelton", 5}, // Critical Emergency
        {102, "Marcus Brody", 1},
        {103, "Clara Oswald", 3}
    };

    printf("--- Unsorted Patient Admission Queue ---\n");
    for (int i = 0; i < 5; i++) {
        printf("ID: %d | Name: %-16s | Urgency Level: %d\n", queue[i].id, queue[i].name, queue[i].triage_urgency);
    }
    printf("\n");

    // 1. Perform Linear Search
    int target = 105;
    int idx = linear_search(queue, 5, target);
    if (idx != -1) {
        printf("[SEARCH] Found Patient ID %d (%s) at index %d via Linear Search.\n\n", target, queue[idx].name, idx);
    }

    // 2. Perform Quicksort by Triage Urgency (Highest urgency first)
    qsort(queue, 5, sizeof(PatientRecord), compare_urgency);

    printf("--- Triage Sorted Patient Queue (Highest Urgency First) ---\n");
    for (int i = 0; i < 5; i++) {
        printf("Priority #%d | ID: %d | Name: %-16s | Urgency: %d\n", i + 1, queue[i].id, queue[i].name, queue[i].triage_urgency);
    }

    return 0;
}
