import { READY_FOR_PRINT } from './../../constants';
export interface PrintComponent {
  [READY_FOR_PRINT](): void;
  ngOnInit(): void;
  ngOnDestroy(): void;
}
