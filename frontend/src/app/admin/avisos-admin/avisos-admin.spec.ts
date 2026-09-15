import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvisosAdmin } from './avisos-admin';

describe('AvisosAdmin', () => {
  let component: AvisosAdmin;
  let fixture: ComponentFixture<AvisosAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvisosAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(AvisosAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
