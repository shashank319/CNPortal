import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Candidate, CandidateStatus } from '../../../../core/models/candidate.model';
import { CandidateService } from '../../../../shared/services/candidate.service';
import { Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatToolbarModule,
    MatCardModule,
    MatTableModule,
    MatSnackBarModule
  ],
  providers: [CandidateService],
  templateUrl: './candidates.component.html',
  styleUrl: './candidates.component.css'
})
export class CandidatesComponent implements OnInit {
  /** Returns chip class for project status */
  getProjectStatusClass(status: CandidateStatus): string {
    if (status === 'inactive' || status === 'rejected') {
      return 'status-ended';
    }
    return 'status-active';
  }
  /** Returns display label for project status */
  getProjectStatusLabel(status: CandidateStatus): string {
    if (status === CandidateStatus.INACTIVE || status === CandidateStatus.REJECTED) {
      return 'Project Ended';
    }
    return 'Active in Project';
  }

  pageIndex = 0;
  pageSize = 5;
  pagedCandidates: Candidate[] = [];
  filteredCandidates: Candidate[] = [];
  searchForm: FormGroup;
  candidates: Candidate[] = [];
  displayedColumns: string[] = ['name', 'contact', 'client', 'status', 'actions'];

  constructor(
    private fb: FormBuilder,
    @Inject(CandidateService) private candidateService: CandidateService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.candidateService.getCandidates().subscribe({
      next: (response) => {
        this.candidates = response.items;
        this.filteredCandidates = [...this.candidates];
        this.pagedCandidates = this.filteredCandidates.slice(0, this.pageSize);
        this.setupSearch();
      },
      error: (error) => {
        console.error('Error fetching candidates:', error);
        this.snackBar.open('Error loading candidates', 'Close', { duration: 3000 });
      }
    });
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    const start = this.pageIndex * this.pageSize;
    this.pagedCandidates = this.filteredCandidates.slice(start, start + this.pageSize);
  }

  private setupSearch(): void {
    this.searchForm.valueChanges.subscribe(values => {
      this.filterCandidates(values);
    });
  }

  private filterCandidates(filters: any): void {
    let filtered = [...this.candidates];

    // Search by name or email
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(candidate =>
        candidate.firstName.toLowerCase().includes(term) ||
        candidate.lastName.toLowerCase().includes(term) ||
        candidate.email.toLowerCase().includes(term)
      );
    }

    this.filteredCandidates = filtered;
    this.pageIndex = 0; // Reset to first page when filtering
    const start = this.pageIndex * this.pageSize;
    this.pagedCandidates = this.filteredCandidates.slice(start, start + this.pageSize);
  }

  getUniqueClients(): string[] {
    const clients = this.candidates.map(c => c.clientName);
    return [...new Set(clients)];
  }

  getStatusBadgeClass(status: CandidateStatus): string {
    switch (status) {
      case CandidateStatus.ACTIVE:
        return 'bg-success';
      case CandidateStatus.INACTIVE:
        return 'bg-secondary';
      case CandidateStatus.INTERVIEWED:
        return 'bg-info';
      case CandidateStatus.HIRED:
        return 'bg-primary';
      case CandidateStatus.REJECTED:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  addNewCandidate(): void {
    this.router.navigate(['/employer/add-employee']);
  }

  editCandidate(candidate: Candidate): void {
    this.router.navigate(['/employer/edit-employee', candidate.candidateId]);
  }

  deleteCandidate(candidate: Candidate): void {
    if (confirm(`Are you sure you want to delete ${candidate.firstName} ${candidate.lastName}?`)) {
      this.candidates = this.candidates.filter(c => c.candidateId !== candidate.candidateId);
      this.filterCandidates(this.searchForm.value);
      this.snackBar.open(`${candidate.firstName} ${candidate.lastName} has been deleted`, 'Close', {
        duration: 3000
      });
    }
  }

  exportCandidates(): void {
    this.snackBar.open('Exporting candidates to Excel...', 'Close', {
      duration: 2000
    });
    // TODO: Implement actual Excel export functionality
    console.log('Exporting candidates:', this.filteredCandidates);
  }

  printCandidates(): void {
    this.snackBar.open('Preparing print preview...', 'Close', {
      duration: 2000
    });
    // TODO: Implement actual print functionality
    window.print();
  }
}
  
