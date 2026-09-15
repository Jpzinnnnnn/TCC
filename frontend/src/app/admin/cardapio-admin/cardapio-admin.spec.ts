import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardapioAdmin } from './cardapio-admin';

describe('CardapioAdmin', () => {
  let component: CardapioAdmin;
  let fixture: ComponentFixture<CardapioAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardapioAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(CardapioAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
