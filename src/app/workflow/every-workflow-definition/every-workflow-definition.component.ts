import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { MessageUtilService } from '../../shared/services/message-util.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-every-workflow-definition',
  templateUrl: './every-workflow-definition.component.html',
  styleUrls: ['./every-workflow-definition.component.scss']
})
export class EveryWorkflowDefinitionComponent implements OnInit {
  public workflowsDefinition: any;

  @Output() workflowTasks: EventEmitter<any> = new EventEmitter<any>();

  public slug: any;
  public taskStatus = 'Seen';


  constructor(private apiService: ApiService,
              private messageService: MessageUtilService,
              private activatedRoute: ActivatedRoute) {
    this.activatedRoute.params.subscribe(routeParams => {
      this.slug = routeParams.Slug;
      this.taskStatus = routeParams.taskStatus || 'Seen';
    });
  }

  async ngOnInit() {
    await this.getEveryWorkflowDefinition();
  }

  async getEveryWorkflowDefinition() {
    this.workflowsDefinition = await this.apiService.getEveryWorkflowDefinition();
  }

  async getTasks(slug: string, status: string) {
    await this.findByIdEveryWorkFlowDefinition(slug, status);
  }

  async findByIdEveryWorkFlowDefinition(Slug: any, taskStatus: string) {
    this.taskStatus = taskStatus;
    this.slug = Slug;
    this.workflowTasks.emit({ taskStatus, Slug });
  }
}
