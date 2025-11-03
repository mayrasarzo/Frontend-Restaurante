import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesaLista } from './mesa-lista';

describe('MesaLista', () => {
  let component: MesaLista;
  let fixture: ComponentFixture<MesaLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesaLista]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesaLista);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
