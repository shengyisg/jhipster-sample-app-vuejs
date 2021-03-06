import { mixins } from 'vue-class-component';

import { Component, Inject } from 'vue-property-decorator';
import Vue2Filters from 'vue2-filters';
import { IOperation } from '@/shared/model/test-root/operation.model';
import AlertMixin from '@/shared/alert/alert.mixin';

import OperationService from './operation.service';

@Component
export default class Operation extends mixins(Vue2Filters.mixin, AlertMixin) {
  @Inject('operationService') private operationService: () => OperationService;
  private removeId: number = null;
  public itemsPerPage = 20;
  public queryCount: number = null;
  public page = 1;
  public previousPage = 1;
  public propOrder = 'id';
  public reverse = true;
  public totalItems = 0;
  public operations: IOperation[] = [];

  public isFetching = false;

  public mounted(): void {
    this.retrieveAllOperations();
  }

  public clear(): void {
    this.page = 1;
    this.retrieveAllOperations();
  }

  public retrieveAllOperations(): void {
    this.isFetching = true;

    const paginationQuery = {
      page: this.page - 1,
      size: this.itemsPerPage,
      sort: this.sort()
    };
    this.operationService()
      .retrieve(paginationQuery)
      .then(
        res => {
          this.operations = res.data;
          this.totalItems = Number(res.headers['x-total-count']);
          this.queryCount = this.totalItems;
          this.isFetching = false;
        },
        err => {
          this.isFetching = false;
        }
      );
  }

  public prepareRemove(instance: IOperation): void {
    this.removeId = instance.id;
  }

  public removeOperation(): void {
    this.operationService()
      .delete(this.removeId)
      .then(() => {
        const message = this.$t('jhipsterApp.testRootOperation.deleted', { param: this.removeId });
        this.alertService().showAlert(message, 'danger');
        this.getAlertFromStore();

        this.removeId = null;
        this.retrieveAllOperations();
        this.closeDialog();
      });
  }

  public sort(): Array<any> {
    const result = [this.propOrder + ',' + (this.reverse ? 'asc' : 'desc')];
    if (this.propOrder !== 'id') {
      result.push('id');
    }
    return result;
  }

  public loadPage(page: number): void {
    if (page !== this.previousPage) {
      this.previousPage = page;
      this.transition();
    }
  }

  public transition(): void {
    this.retrieveAllOperations();
  }

  public changeOrder(propOrder): void {
    this.propOrder = propOrder;
    this.reverse = !this.reverse;
    this.transition();
  }

  public closeDialog(): void {
    (<any>this.$refs.removeEntity).hide();
  }
}
